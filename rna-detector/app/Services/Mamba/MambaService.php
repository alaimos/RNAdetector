<?php

namespace App\Services\Mamba;

use App\Services\Mamba\Facade\Command;
use App\Services\Mamba\Contracts\ConvertibleToCommand;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Process;

class MambaService
{
    /**
     * @var string[]|null
     */
    private ?array $environments = null;

    /**
     * Registers the process handlers in the Process facade.
     */
    public static function registerProcessHandler(): void
    {
        if (! Process::hasMacro('startCommand')) {
            Process::macro(
                'startCommand',
                function (ConvertibleToCommand $command, ?callable $output = null) {
                    // @phpstan-ignore-next-line
                    return $this->forever()->start($command->toCommand(), $output);
                }
            );
        }
        if (! Process::hasMacro('runCommand')) {
            Process::macro(
                'runCommand',
                function (ConvertibleToCommand $command, ?callable $output = null, ?int $timeout = null) {
                    /** @noinspection OneTimeUseVariablesInspection */
                    // @phpstan-ignore-next-line
                    $process = ($timeout) ? $this->timeout($timeout) : $this->forever();

                    return $process->run($command->toCommand(), $output);
                }
            );
        }
        if (! Process::hasMacro('json')) {
            Process::macro(
                'json',
                function (ConvertibleToCommand|array $command): array {
                    if ($command instanceof ConvertibleToCommand) {
                        /** @noinspection CallableParameterUseCaseInTypeContextInspection */
                        $command = $command->toCommand();
                        if (! $command) {
                            return [];
                        }
                    }
                    // @phpstan-ignore-next-line
                    $process = $this->run($command);
                    if ($process->failed()) {
                        throw ProcessExecutionException::of($process);
                    }

                    return json_decode($process->output(), true, 512, JSON_THROW_ON_ERROR);
                }
            );
        }
    }

    /**
     * Creates a new environment.
     */
    public function create(string $name): Environment
    {
        $environments = $this->environments();
        if (in_array($name, $environments, true)) {
            return $this->newEnvObject($name);
        }
        $result = Process::json(
            Command::mamba('create', $name)->json()
        );
        if (! ($result['success'] ?? false)) {
            throw new MambaException($result['message']);
        }
        $this->environments[] = $name;

        return $this->newEnvObject($name);
    }

    /**
     * Returns an environment object.
     */
    public function environment(string $name): Environment
    {
        if (! in_array($name, $this->environments(), true)) {
            throw new MambaException("Environment $name does not exist.");
        }

        return $this->newEnvObject($name);
    }

    /**
     * Returns a list of the available environments.
     *
     * @return string[]
     */
    public function environments(): array
    {
        if ($this->environments === null) {
            $info = Process::json(
                Command::mamba('info')->json()
            );
            $envs = $info['envs'] ?? [];
            $envDirs = $info['env_dirs'] ?? [];
            $condaPrefix = $info['conda_prefix'] ?? '';
            foreach ($envDirs as $envDir) {
                $envs = Arr::map(
                    $envs,
                    static fn (string $env) => str_replace($envDir, '', $env)
                );
            }
            if ($condaPrefix) {
                $envs = Arr::map(
                    $envs,
                    static fn (string $env) => str_replace($condaPrefix, '', $env)
                );
            }
            $this->environments = Arr::where(
                array_filter(Arr::map(
                    $envs,
                    static fn (string $env) => basename($env)
                )),
                static fn (string $env) => $env !== 'base'
            );
        }

        return $this->environments;
    }

    /**
     * Instantiates an environment object.
     */
    private function newEnvObject(string $name): Environment
    {
        return new Environment(
            $name,
            function () use ($name) {
                $this->environments = Arr::where(
                    $this->environments,
                    static fn (string $env) => $env !== $name
                );
            }
        );
    }
}
