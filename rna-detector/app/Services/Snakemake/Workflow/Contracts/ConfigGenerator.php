<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use Illuminate\Contracts\Support\Arrayable;

/**
 * @extends Arrayable<string, mixed>
 */
interface ConfigGenerator extends Arrayable
{
    /**
     * Convert an array to a Source instance. For example, when loading from a JSON
     * file, the JSON is decoded to an array and then converted to a Source instance.
     *
     * @param  array<string, mixed>  $data
     */
    public static function from(array $data): static;

    public function write(): void;
}
