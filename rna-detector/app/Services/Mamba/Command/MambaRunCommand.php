<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Command\Facade\Command as CommandFacade;
use App\Services\Mamba\Command\Flags\NonMergeableFlag;
use App\Services\Mamba\Contracts\ConvertibleToCommand;
use Closure;

/**
 * @phpstan-consistent-constructor
 */
class MambaRunCommand extends MambaCommand
{
    public function __construct()
    {
        parent::__construct();
        $this->command[] = 'run';
    }

    /**
     * Set the working directory for the command.
     *
     * @return $this
     */
    public function cwd(string $path): self
    {
        return $this->withFlag(NonMergeableFlag::make('--cwd', $path));
    }

    /**
     * Tell mamba to avoid capturing the output of the command
     * and instead stream it directly to the console.
     *
     * @return $this
     */
    public function live(): self
    {
        return $this->withFlag(NonMergeableFlag::make('--live-stream'));
    }

    /**
     * Set the command to run.
     *
     * @param  \App\Services\Mamba\Contracts\ConvertibleToCommand|\Closure(\App\Services\Mamba\Command\Command): \App\Services\Mamba\Command\Command  $command
     * @return $this
     */
    public function command(ConvertibleToCommand|Closure $command): self
    {
        return $this->withPositionalArguments(
            value($command, CommandFacade::generic())
        );
    }
}
