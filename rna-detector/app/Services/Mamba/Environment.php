<?php

namespace App\Services\Mamba;

use App\Services\Mamba\Contracts\ConvertibleToCommand;
use App\Services\Mamba\Contracts\Logger;
use App\Services\Mamba\Facade\Command;
use Closure;
use Illuminate\Process\InvokedProcess;
use Illuminate\Process\ProcessResult;
use Illuminate\Support\Facades\Process;

readonly class Environment
{
    public function __construct(private string $name, private Closure $onRemove) {}

    /**
     * Removes the environment.
     */
    public function remove(): void
    {
        $process = Process::runCommand(
            Command::mamba(['env', 'remove'], $this->name)->nonInteractive()->json()
        );
        if ($process->failed()) {
            throw ProcessExecutionException::of($process);
        }
        ($this->onRemove)();
    }

    /**
     * Installs the specified packages in the environment.
     *
     * @param  string|string[]  $packages
     * @param  string|string[]|null  $channels
     */
    public function install(
        string|array $packages,
        string|array|null $channels = null,
        ?Logger $output = null
    ): InvokedProcess {
        $command = Command::mamba('install', $this->name)
            ->nonInteractive()
            ->withPositionalArguments($packages)
            ->when($channels)
            ->withFlag(Command::flag('-c', $channels)->repeatable());

        return Process::startCommand(
            $command,
            $output
        );
    }

    /**
     * Uninstalls the specified packages from the environment.
     *
     * @param  string|string[]  $packages
     * @param  string|string[]|null  $channels
     */
    public function uninstall(
        string|array $packages,
        string|array|null $channels = null,
        ?Logger $output = null
    ): InvokedProcess {
        $command = Command::mamba('remove', $this->name)
            ->nonInteractive()
            ->withPositionalArguments($packages)
            ->when($channels)
            ->withFlag(Command::flag('-c', $channels)->repeatable());

        return Process::startCommand(
            $command,
            $output
        );
    }

    /**
     * Lists the packages installed in the environment.
     *
     * @return array<array{name: string, version: string, build_string: string, channel: string}>
     */
    public function list(): array
    {
        return Process::json(
            Command::mamba('list', $this->name)->json()
        );
    }

    /**
     * Runs the specified command in the environment and wait for it to finish.
     * The liveOutput option is ignored if the output callback is provided,
     * since in that case we must have a live output to stream to the callback.
     * The timeout option should be used to limit the execution time of the command,
     * since run is a blocking operation. However, by default, the timeout is set to null,
     * which means that the command will run indefinitely. Setting the timeout to 0
     * will also disable the timeout.
     *
     * @param  ConvertibleToCommand|(callable(\App\Services\Mamba\Command\Command): mixed)  $command  The command to run.
     * @param  Logger|null  $output  An optional logger to log the output.
     * @param  string|null  $cwd  An optional working directory.
     * @param  bool|null  $liveOutput  Whether to stream the output live.
     * @param  int|null  $timeout  An optional timeout in seconds.
     */
    public function run(
        ConvertibleToCommand|callable $command,
        ?Logger $output = null,
        ?string $cwd = null,
        ?bool $liveOutput = false,
        ?int $timeout = null
    ): ProcessResult {
        $command = $this->getCommand($command);
        $liveOutput = $output !== null || $liveOutput;

        return Process::runCommand(
            Command::mambaRun($command, $cwd, $liveOutput),
            $output,
            $timeout
        );
    }

    /**
     * Starts the specified command in the environment using an async process.
     *
     * @param  ConvertibleToCommand|(callable(\App\Services\Mamba\Command\Command): mixed)  $command
     */
    public function start(
        ConvertibleToCommand|callable $command,
        ?Logger $output = null,
        ?string $cwd = null
    ): InvokedProcess {
        $command = $this->getCommand($command);

        return Process::startCommand(
            Command::mambaRun($command, $cwd, true),
            $output
        );
    }

    /**
     * Returns the command to run.
     *
     * @param  ConvertibleToCommand|(callable(\App\Services\Mamba\Command\Command): mixed)  $command
     */
    private function getCommand(ConvertibleToCommand|callable $command): ConvertibleToCommand
    {
        if ($command instanceof ConvertibleToCommand) {
            return $command;
        }

        return tap(Command::generic(), $command);
    }
}
