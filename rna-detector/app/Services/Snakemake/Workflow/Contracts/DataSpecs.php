<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use Illuminate\Contracts\Support\Arrayable;

/**
 * @extends Arrayable<string, mixed>
 */
interface DataSpecs extends Arrayable
{
    /**
     * Convert an array to a Source instance. For example, when loading from a JSON
     * file, the JSON is decoded to an array and then converted to a Source instance.
     *
     * @param  array<string, mixed>  $data
     */
    public static function from(array $data): static;

    /**
     * @return \App\Models\Dataset[]
     */
    public function collectDatasets(): array;

    /**
     * @return array<int, \App\Models\Data>
     */
    public function collectData(): array;

    /**
     * @return array<string, array<string, string>>
     */
    public function collectDataFiles(): array;
}
