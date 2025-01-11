<?php

namespace App\Services\Snakemake\Workflow\Contracts\Data;

use App\Models\Data;
use App\Models\Dataset;

interface DataPathResolver
{
    /**
     * Resolve the path of a data file of a specific type relative to the workflow directory.
     * If the path is null, the data file will be ignored.
     */
    public function __invoke(string $type, string $contentName, Data $data, Dataset $dataset): ?string;

    /**
     * Returns an array of the types of data files that can be resolved by this resolver.
     *
     * @return string[]
     */
    public function resolvedTypes(): array;

    /**
     * Create a resolver that returns the path of a data file relative to the workflow directory.
     */
    public static function from(mixed ...$args): static;
}
