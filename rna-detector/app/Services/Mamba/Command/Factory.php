<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Command\Flags\Flag;
use App\Services\Mamba\Contracts\ConvertibleToCommand;
use Closure;
use Illuminate\Support\Traits\Macroable;

class Factory
{
    use Macroable {
        __call as macroCall;
    }

    /**
     * Make a new generic command.
     */
    public function generic(string|array|null $command = null): Command
    {
        return tap(new Command, static function ($commandInstance) use ($command) {
            if ($command) {
                $commandInstance->call($command);
            }
        });
    }

    /**
     * Make a new Mamba command.
     */
    public function mamba(string|array|null $command = null, ?string $env = null): MambaCommand
    {
        return tap(new MambaCommand, static function ($mambaCommand) use ($command, $env) {
            if ($command) {
                $mambaCommand->call($command);
            }
            if ($env) {
                $mambaCommand->env($env);
            }
        });
    }

    /**
     * Make a new Mamba run command.
     *
     * @param  null|\App\Services\Mamba\Contracts\ConvertibleToCommand|\Closure(\App\Services\Mamba\Command\Command): \App\Services\Mamba\Command\Command  $command
     */
    public function mambaRun(ConvertibleToCommand|Closure|null $command = null, ?string $cwd = null, bool $live = false): MambaRunCommand
    {
        return tap(new MambaRunCommand, static function ($mambaRunCommand) use ($command, $cwd, $live) {
            if ($cwd) {
                $mambaRunCommand->cwd($cwd);
            }
            if ($live) {
                $mambaRunCommand->live();
            }
            if ($command) {
                $mambaRunCommand->command($command);
            }
        });
    }

    /**
     * Create a new flag.
     *
     * @param  null|bool|string|array<null|bool|string>|(\Closure(): bool|string|null)  $value
     */
    public function flag(string $flag, string|array|bool|null|Closure $value = true): Flag
    {
        return Flag::make($flag, $value);
    }

    /**
     * Handle dynamic calls to the object.
     * For example, to create new command classes.
     *
     * @param  string  $method
     * @param  array  $parameters
     * @return mixed
     */
    public function __call($method, $parameters)
    {
        return $this->macroCall($method, $parameters);
    }
}
