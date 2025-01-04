<?php

namespace App\Services\Mamba\Contracts;

interface ConvertibleToCommand
{
    /**
     * Convert the element to an array of command arguments.
     *
     * @return string[]|null
     */
    public function toCommand(): ?array;
}
