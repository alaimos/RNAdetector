<?php

namespace App\Services\Snakemake\Workflow\Contracts\Data;

use Illuminate\Config\Repository as ConfigRepository;
use Illuminate\Contracts\Support\Arrayable;

/**
 * @extends Arrayable<int, \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset>
 */
interface Descriptor extends Arrayable
{
    /**
     * Convert an array to a Source instance. For example, when loading from a JSON
     * file, the JSON is decoded to an array and then converted to a Source instance.
     *
     * @param  array<string, mixed>  $data
     */
    public static function from(array $data): static;

    /**
     * Set the configuration object to use when collecting datasets.
     */
    public function withConfig(ConfigRepository $config): self;

    /**
     * Set the path resolver to use when collecting datasets.
     */
    public function withPathResolver(DataPathResolver $pathResolver): self;

    /**
     * Collect the datasets described by the descriptor.
     *
     * @return \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]
     */
    public function collect(): array;
}
