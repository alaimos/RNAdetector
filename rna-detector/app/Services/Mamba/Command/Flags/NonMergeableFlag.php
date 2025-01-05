<?php

namespace App\Services\Mamba\Command\Flags;

use Override;

class NonMergeableFlag extends Flag
{
    /**
     * Merge the flag with another flag.
     * If the flags are different, the flag is not merged.
     * If one of the values is a closure, the merge is postponed.
     *
     * @return $this
     */
    #[Override]
    public function merge(...$ignore): self
    {
        return $this;
    }
}
