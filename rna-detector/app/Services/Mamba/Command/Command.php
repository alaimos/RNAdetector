<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Contracts\ConvertibleToCommand;
use Illuminate\Support\Arr;
use Override;

final class Command implements ConvertibleToCommand
{
    /**
     * @var string[]
     */
    private array $command = [];

    /**
     * @var array<string, \App\Services\Mamba\Command\Flag>
     */
    private array $flags = [];

    /**
     * @var ConvertibleToCommand[]
     */
    private array $positionalArguments = [];

    /**
     * Set the name of the command to be executed.
     *
     * @param  string|string[]  $command
     * @return $this
     */
    public function call(array|string $command): self
    {
        if (! is_array($command)) {
            $command = [$command];
        }
        $this->command[] = $command;

        return $this;
    }

    /**
     * Add one flag to the command.
     * The flag can be a boolean, a string or a closure that returns a boolean or a string.
     * If the flag is a boolean and is true, the flag will be added to the command.
     * If the flag is a string, the flag will be added to the command with the string value.
     *
     * @param  null|bool|string|array<null|bool|string>|(\Closure(): bool|string|null|array<null|bool|string>)  $value
     * @return $this
     */
    public function withFlag(string|Flag $flag, mixed $value = null): self
    {
        if (is_string($flag)) {
            $flag = Flag::make($flag, $value);
        }
        if (isset($this->flags[$flag->flag])) {
            $this->flags[$flag->flag]->merge($flag);
        } else {
            $this->flags[$flag->flag] = $flag;
        }

        return $this;
    }

    /**
     * Add multiple flags to the command.
     * See the withFlag method for more information about the flags.
     *
     * @param  Flag[]|array<string,null|bool|string|(\Closure(): bool|string|null)>  $flags
     * @return $this
     */
    public function withFlags(array $flags): self
    {
        foreach ($flags as $flag => $value) {
            if (is_string($flag)) {
                $flag = Flag::make($flag, $value);
            }
            $this->withFlag($flag);
        }

        return $this;
    }

    /**
     * Add one or more positional arguments to the command.
     *
     * @param  string|ConvertibleToCommand|(string|ConvertibleToCommand)[]  $argument
     * @return $this
     */
    public function withPositionalArguments(string|ConvertibleToCommand|array $argument): self
    {
        if (! is_array($argument)) {
            $argument = [$argument];
        }
        foreach ($argument as $arg) {
            $this->positionalArguments[] = ($arg instanceof ConvertibleToCommand) ? $arg : PositionalArgument::make($arg);
        }

        return $this;
    }

    /**
     * Add a flag indicating that the command should output JSON.
     *
     * @return $this
     */
    public function requiresJsonOutput(string $jsonFlag = '--json'): self
    {
        $this->withFlag(Flag::makeJson($jsonFlag));

        return $this;
    }

    /**
     * Convert the element to an array of command arguments.
     *
     * @return string[]
     */
    #[Override]
    public function toCommand(): array
    {
        return [
            ...$this->command,
            ...$this->gatherFlags(),
            ...$this->gatherPositionalArguments(),
        ];
    }

    /**
     * Gather all the flags to be added to the command.
     *
     * @return string[]
     */
    private function gatherFlags(): array
    {
        return Arr::flatten(
            ...array_filter(
                array_map(
                    static fn (Flag $f) => $f->toCommand(),
                    array_values($this->flags)
                )
            )
        );
    }

    /**
     * Gather all the positional arguments to be added to the command.
     *
     * @return string[]
     */
    private function gatherPositionalArguments(): array
    {
        return Arr::flatten(
            ...array_filter(
                array_map(
                    static fn (ConvertibleToCommand $c) => $c->toCommand(),
                    array_values($this->positionalArguments)
                )
            )
        );
    }
}
