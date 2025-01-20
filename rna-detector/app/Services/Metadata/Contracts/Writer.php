<?php

namespace App\Services\Metadata\Contracts;

use App\Services\Metadata\Container as MetadataContainer;

interface Writer
{
    /**
     * Get the supported extensions for the writer.
     */
    public static function supportedExtensions(): array;

    /**
     * Make a new instance of the metadata container from an array of parameters.
     *
     * @param  array<string, mixed>  $params
     */
    public static function from(array $params): static;

    /**
     * Write metadata to a file.
     */
    public function write(string $file, MetadataContainer $container): void;
}
