<?php

namespace App\Services\Snakemake\Workflow\Contracts\Data;

use App\Models\Data;
use App\Models\Dataset;

interface ResolverInvokable
{
    /**
     * Returns the type of data files that can be resolved by this resolver.
     */
    public function type(): string;

    /**
     * Resolve the path of a data file of a specific type relative to the workflow directory.
     * If the path is null, the data file will be ignored.
     */
    public function __invoke(string $contentName, Data $data, Dataset $dataset): ?string;
}
