<?php

namespace App\Services\Snakemake\Workflow\Contracts\Data;

use ArrayAccess;
use Illuminate\Contracts\Config\Repository as ConfigContract;
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
     *
     * @param  ArrayAccess<string, mixed>&ConfigContract  $config
     */
    public function withConfig(ArrayAccess&ConfigContract $config): self;

    /**
     * Set the path resolver to use when collecting datasets.
     */
    public function withPathResolver(DataPathResolver $pathResolver): self;

    /**
     * @return \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]
     */
    public function collect(): array;
}
