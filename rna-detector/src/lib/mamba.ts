import { spawn } from "child_process";
import { basename } from "path";

export type ProgressFn = (data: string) => void;

function prepareCommand(
  command: string | string[],
  flags?: Record<string, any>,
  positional?: string[],
  json = true,
) {
  const cmdList = [...(Array.isArray(command) ? command : [command])];
  if (flags) {
    for (const [flag, value] of Object.entries(flags)) {
      if (value !== false && value !== null && value !== undefined) {
        cmdList.push(flag);
        if (Array.isArray(value)) {
          cmdList.push(...value);
        } else if (value !== true) {
          cmdList.push(value);
        }
      }
    }
  }
  if (json) cmdList.push("--json");
  if (positional && positional.length > 0) cmdList.push(...positional);
  return cmdList;
}

async function runCommand(
  commandArray: string[],
  cwd?: string,
  onProgress?: ProgressFn,
  onStderr?: ProgressFn,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(process.env.MAMBA_BIN, commandArray, {
      env: process.env,
      cwd: cwd,
    });
    p.stdout.setEncoding("utf8");
    const buffer: string[] = [];
    p.stdout.on("data", (data) => {
      if (onProgress) onProgress(data.toString());
      buffer.push(data.toString());
    });
    if (onStderr) {
      p.stderr.setEncoding("utf8");
      p.stderr.on("data", onStderr);
    }
    p.on("error", (err) => {
      reject(err);
    });
    p.on("close", (code) => {
      if (code === 0) {
        resolve(buffer.join(""));
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function runCommandJSON<T extends Record<string, any>>(
  commandArray: string[],
  cwd?: string,
): Promise<T> {
  return runCommand(commandArray, cwd).then(
    (output) => JSON.parse(output) as T,
  );
}

class MambaEnv {
  /**
   * Current working directory for the commands
   */
  cwd: string | undefined = undefined;
  constructor(
    private name: string,
    private onRemove: (name: string) => Promise<void>,
  ) {}
  /**
   * Remove the environment
   */
  async remove() {
    const cmd = prepareCommand(
      ["env", "remove"],
      {
        "-n": this.name,
        "-y": true,
      },
      undefined,
      true,
    );
    await runCommand(cmd);
    await this.onRemove(this.name);
  }
  /**
   * Install packages in the environment
   * @param packages Package names
   * @param channel Conda channel (optional)
   * @param onProgress Progress callback (optional)
   */
  async install({
    packages,
    channel,
    onProgress,
  }: {
    packages: string | string[];
    channel?: string;
    onProgress?: ProgressFn;
  }) {
    const cmd = prepareCommand(
      "install",
      {
        "-n": this.name,
        "-y": true,
        // "-q": true,
        "-c": channel,
      },
      Array.isArray(packages) ? packages : [packages],
      false,
    );
    await runCommand(cmd, this.cwd, onProgress);
  }
  /**
   * Uninstall a package from the environment
   * @param packages Package name
   * @param channel Conda channel (optional)
   * @param onProgress Progress callback (optional)
   */
  async uninstall({
    packages,
    channel,
    onProgress,
  }: {
    packages: string | string[];
    channel?: string;
    onProgress?: ProgressFn;
  }) {
    const cmd = prepareCommand(
      "remove",
      {
        "-n": this.name,
        "-y": true,
        // "-q": true,
        "-c": channel,
      },
      Array.isArray(packages) ? packages : [packages],
      false,
    );
    await runCommand(cmd, this.cwd, onProgress);
  }
  /**
   * List all packages in the environment
   */
  async list() {
    const cmd = prepareCommand(
      "list",
      {
        "-n": this.name,
      },
      undefined,
      true,
    );
    return runCommandJSON<
      {
        name: string;
        version: string;
        build_string: string;
        channel: string;
      }[]
    >(cmd);
  }
  /**
   * Run a command in the environment
   * @param cmd Command to run
   * @param onProgress Progress callback (optional)
   * @param onStderr Stderr callback (optional)
   * @param cwd Current working directory (optional)
   */
  async run({
    cmd,
    onProgress,
    onStderr,
    cwd,
  }: {
    cmd: string[];
    onProgress?: ProgressFn;
    onStderr?: ProgressFn;
    cwd?: string;
  }) {
    const command = prepareCommand(
      "run",
      {
        "-n": this.name,
        "--cwd": cwd ?? this.cwd,
      },
      cmd,
      false,
    );
    return runCommand(command, cwd ?? this.cwd, onProgress, onStderr);
  }
}

class Mamba {
  #envs: string[] | undefined = undefined;
  constructor() {}
  /**
   * Create a new environment
   * @param name Name of the environment
   */
  async createEnv(name: string) {
    const envs = await this.envs();
    if (envs.includes(name)) {
      return this._newEnvObject(name);
    }
    const cmd = prepareCommand(
      "create",
      {
        "-n": name,
      },
      undefined,
      true,
    );
    const result = await runCommandJSON<{
      prefix: string;
      success: boolean;
    }>(cmd);
    if (!result.success) {
      throw new Error("Failed to create environment");
    }
    envs.push(name);
    return this._newEnvObject(name);
  }
  /**
   * Get an environment by name
   * @param name Name of the environment
   */
  async env(name: string) {
    const envs = await this.envs();
    if (!envs.includes(name)) {
      return undefined;
    }
    return this._newEnvObject(name);
  }
  /**
   * List all environments
   */
  async envs() {
    if (!this.#envs) {
      const cmd = prepareCommand("info", undefined, undefined, true);
      const result = await runCommandJSON<{
        conda_prefix: string;
        envs: string[];
        envs_dirs: string[];
      }>(cmd);
      let envs = result.envs;
      for (const env_dir of result.envs_dirs) {
        envs = envs.map((env) => env.replace(env_dir, ""));
      }
      envs = envs
        .map((env) => basename(env.replace(result.conda_prefix, "")))
        .filter((env) => env !== "");
      envs.unshift("base");
      this.#envs = envs;
    }
    return this.#envs;
  }

  private _newEnvObject(name: string) {
    return new MambaEnv(name, async (name) => {
      if (this.#envs) {
        this.#envs = this.#envs.filter((env) => env !== name);
      }
    });
  }
}

export const mamba = new Mamba();
