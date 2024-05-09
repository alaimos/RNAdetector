import { mamba, ProgressFn } from "@/lib/mamba";
import { existsSync as exists } from "fs";

const mambaEnv = await mamba.env(process.env.SNAKEMAKE_ENV);

class Snakemake {
  constructor() {}
  async pullWorkflow({
    repository,
    destination,
    tag,
    branch,
    onProgress,
  }: {
    repository: string;
    destination: string;
    tag?: string;
    branch?: string;
    onProgress?: ProgressFn;
  }) {
    const cmd = ["snakedeploy", "deploy-workflow", repository, destination];
    if (tag) {
      cmd.push("--tag", tag);
    }
    if (branch) {
      cmd.push("--branch", branch);
    }
    await mambaEnv?.run({
      cmd,
      onProgress,
    });
    if (!exists(destination)) {
      throw new Error(`The destination folder ${destination} does not exist.`);
    }
  }
  async runWorkflow({
    workflowDir,
    cores,
    onProgress,
    debug,
  }: {
    workflowDir: string;
    cores: number | "all";
    onProgress?: ProgressFn;
    debug?: boolean;
  }) {
    const cmd = ["snakemake", "--cores", cores.toString(), "--use-conda"];
    if (debug) {
      cmd.push("--verbose");
    }
    await mambaEnv?.run({
      cmd,
      cwd: workflowDir,
      onProgress,
    });
  }
}

export const snakemake = new Snakemake();
