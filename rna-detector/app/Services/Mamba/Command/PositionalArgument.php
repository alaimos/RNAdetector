<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Contracts\ConvertibleToCommand;

final readonly class PositionalArgument implements ConvertibleToCommand
{
    public function __construct(public string $argument) {}

    public static function make(string $argument): self
    {
        return new self($argument);
    }

    /**
     * Convert the element to an array of command arguments.
     *
     * @return string[]|null
     */
    public function toCommand(): ?array
    {
        return empty($this->argument) ? null : [$this->argument];
    }
}
