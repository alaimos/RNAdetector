<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Command\Flags\NonMergeableFlag;

/**
 * @phpstan-consistent-constructor
 */
class MambaCommand extends Command
{
    public function __construct()
    {
        $this->command = [
            config('rnadetector.mamba_bin_path'),
        ];
    }

    /**
     * Set the name of the current Mamba Environment.
     *
     * @return $this
     */
    public function env(string $name): self
    {
        return $this->withFlag(NonMergeableFlag::make('-n', $name));
    }

    /**
     * Add a flag indicating that the command should output JSON.
     *
     * @return $this
     */
    public function json(): self
    {
        return $this->withFlag(NonMergeableFlag::make('--json'));
    }

    /**
     * Add a flag indicating that the command should be non-interactive.
     *
     * @return $this
     */
    public function nonInteractive(): self
    {
        return $this->withFlag(NonMergeableFlag::make('-y'));
    }
}
