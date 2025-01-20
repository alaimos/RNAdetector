<?php

namespace App\Services\Metadata\Writers;

use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Metadata\Contracts\Writer;
use Illuminate\Support\Facades\File;
use Override;

readonly class Json implements Writer
{
    /**
     * Create a new JSON reader.
     *
     * @param  bool  $bySample  If the metadata file is organized by sample instead of by metadata variable.
     */
    public function __construct(private bool $bySample = false) {}

    /**
     * {@inheritDoc}
     */
    public static function from(array $params): static
    {
        return new static($params['by_sample'] ?? false); // @phpstan-ignore-line
    }

    /**
     * Write metadata to a file.
     *
     * @throws \JsonException
     */
    #[Override]
    public function write(string $file, MetadataContainer $container): void
    {
        File::put(
            path: $file,
            contents: $this->bySample ? $container->toSampleJson(JSON_PRETTY_PRINT) : $container->toJson(JSON_PRETTY_PRINT)
        );
    }
}
