<?php

namespace App\Services\Metadata\Contracts;

use App\Services\Metadata\Container as MetadataContainer;

interface Reader
{
    /**
     * Make a new instance of the metadata reader from an array of parameters.
     *
     * @param  array<string, mixed>  $params
     */
    public static function from(array $params): static;

    /**
     * Read metadata from a file.
     */
    public function read(string $file): MetadataContainer;
}
