<?php

namespace App\Services\Metadata\Readers;

use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Metadata\Contracts\Reader;
use Illuminate\Support\Facades\File;
use Override;

readonly class Json implements Reader
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
     * {@inheritDoc}
     */
    public function read(string $file): MetadataContainer
    {
        $data = File::json($file);
        if ($this->bySample) {
            $data = $this->transformBySample($data);
        }

        return MetadataContainer::from($data);
    }

    /**
     * Transform the metadata so that it is organized by metadata variable instead of by sample.
     *
     * @param  array<string, array<string, mixed>>  $originalMetadata
     * @return array<string, array<string, mixed>>
     */
    private function transformBySample(array $originalMetadata): array
    {
        $transformedMetadata = [];
        foreach ($originalMetadata as $sample => $values) {
            foreach ($values as $name => $value) {
                if (! isset($transformedMetadata[$name])) {
                    $transformedMetadata[$name] = [];
                }
                $transformedMetadata[$name][$sample] = $value;
            }
        }

        return $transformedMetadata;
    }

    /**
     * Get a list of supported file extensions that the reader can read.
     */
    #[Override]
    public static function supportedExtensions(): array
    {
        return ['json'];
    }
}
