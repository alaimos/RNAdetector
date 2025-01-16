<?php

namespace App\Services\Metadata;

use Countable;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Support\Arr;
use IteratorAggregate;
use Override;
use Traversable;

/**
 * A container for metadata for a workflow.
 * The metadata is an array where the keys are the metadata variable names, and the values are arrays where
 * the keys are sample names and the values are the metadata values.
 *
 * @implements \IteratorAggregate<string, array<string, mixed>>
 * @implements Arrayable<string, array<string, mixed>>
 */
class Container implements Arrayable, Countable, IteratorAggregate, Jsonable
{
    /**
     * The names of the metadata variables.
     *
     * @var array<string>
     */
    private array $metadataVariableNames = [];

    /**
     * The names of the samples.
     *
     * @var array<string>
     */
    private array $sampleNames = [];

    /**
     * A cache used to store metadata values.
     */
    private array $valueCache = [];

    /**
     * A cache used to store metadata values by sample.
     */
    private ?array $metadataBySampleCache = null;

    /**
     * Create a new metadata container.
     *
     * Metadata are arrays where keys are the metadata variable names, and the values are arrays.
     * The value arrays have sample names as keys.
     *
     * @param  array<string, array<string, mixed>>  $metadata
     */
    public function __construct(public private(set) array $metadata)
    {
        $this->initializeNames();
    }

    /**
     * Make a new instance from an array of metadata or
     * a metadata reader object.
     *
     * @param  array<string, array<string, mixed>>  $metadata
     */
    public static function from(array $metadata = []): static
    {
        return new static($metadata); // @phpstan-ignore-line
    }

    /**
     * Merge another set of metadata into this one.
     *
     * @return $this
     */
    public function merge(Container $container): self
    {
        $metadata = $container->metadata;

        foreach ($metadata as $key => $value) {
            if (! isset($this->metadata[$key])) {
                $this->metadata[$key] = [];
            }

            $this->metadata[$key] = array_merge($this->metadata[$key], $value);
        }

        $this->metadataBySampleCache = null;
        $this->valueCache = [];

        return $this;
    }

    /**
     * Iterate this object as an array of metadata.
     *
     * @return Traversable<string, array<string, mixed>>
     */
    #[Override]
    public function getIterator(): Traversable
    {
        yield from $this->metadata;
    }

    /**
     * Iterate this object as an array of samples.
     *
     * @return Traversable<string, array<string, mixed>>
     */
    public function getSamplesIterator(): Traversable
    {
        if ($this->metadataBySampleCache === null) {
            $this->collectMetadataBySample();
        }
        yield from $this->metadataBySampleCache;
    }

    /**
     * Count the number of metadata variables.
     *
     * @return int<0,max>
     */
    #[Override]
    public function count(): int
    {
        return count($this->metadata);
    }

    /**
     * Count the number of samples.
     *
     * @return int<0,max>
     */
    public function countSamples(): int
    {
        return count($this->sampleNames);
    }

    /**
     * Get the metadata.
     * If no arguments are provided, the entire metadata array is returned.
     * If only the variable is provided, the metadata for that variable is returned.
     * If only the sample is provided, the metadata for that sample is returned.
     * If both the variable and the sample are provided, the metadata value for that variable and sample is returned.
     *
     * @return mixed|array<string, mixed>|array<string, array<string, mixed>>|null
     */
    public function get(string|int|null $variable = null, string|int|null $sample = null): mixed
    {
        if ($variable === null && $sample === null) {
            return $this->metadata;
        }
        $sample = is_int($sample) ? $this->sampleNames[$sample] : $sample;
        $variable = is_int($variable) ? $this->metadataVariableNames[$variable] : $variable;
        if ($variable === null) {
            return $this->getSampleMetadata($sample);
        }
        if ($sample === null) {
            return $this->metadata[$variable] ?? null;
        }

        return $this->metadata[$variable][$sample] ?? null;
    }

    /**
     * Get all metadata of a sample.
     *
     * @return array<string, mixed>
     */
    public function getSampleMetadata(string|int $sample): array
    {
        $sample = is_int($sample) ? $this->sampleNames[$sample] : $sample;
        if ($this->metadataBySampleCache !== null && isset($this->metadataBySampleCache[$sample])) {
            return $this->metadataBySampleCache[$sample];
        }
        $sampleVariables = [];
        /** @noinspection PhpLoopCanBeConvertedToArrayMapInspection */
        foreach ($this->metadata as $variable => $values) {
            $sampleVariables[$variable] = $values[$sample] ?? null;
        }

        return $sampleVariables;
    }

    /**
     * Get the array of available values for a metadata variable.
     * If the variable does not exist, null is returned.
     */
    public function getVariableValues(string $variable): ?array
    {
        if (! isset($this->metadata[$variable])) {
            return null;
        }
        if (isset($this->valueCache[$variable])) {
            return $this->valueCache[$variable];
        }
        $values = array_unique(array_values($this->metadata[$variable]));
        $this->valueCache[$variable] = $values;

        return $this->valueCache[$variable];
    }

    /**
     * Convert to a JSON object where the keys are the metadata variable names, and the values are objects
     * of sample names and metadata values.
     *
     * @param  int  $options
     *
     * @throws \JsonException
     */
    #[Override]
    public function toJson($options = 0): string
    {
        return json_encode($this->metadata, JSON_THROW_ON_ERROR | $options);
    }

    /**
     * Convert to a JSON object where the keys are the sample names, and the values are objects of metadata variable
     * names and metadata values.
     *
     * @throws \JsonException
     */
    public function toSampleJson(int $options = 0): string
    {
        return json_encode($this->toSampleArray(), JSON_THROW_ON_ERROR | $options);
    }

    /**
     * Initialize the metadata variable names and sample names.
     */
    private function initializeNames(): void
    {
        $this->metadataVariableNames = array_keys($this->metadata);
        $this->sampleNames = array_unique(
            Arr::flatten(
                Arr::map($this->metadata, static fn ($metadata) => array_keys($metadata))
            )
        );
    }

    /**
     * Returns the metadata as an array, where the keys are the metadata variable names, and the values are arrays
     * of sample names and metadata values.
     *
     * @return array<string, array<string, mixed>>
     */
    public function toArray(): array
    {
        return $this->metadata;
    }

    /**
     * Returns the metadata as an array, where the keys are the sample names, and the values are arrays of metadata
     * variable names and metadata values.
     *
     * @return array<string, array<string, mixed>>
     */
    public function toSampleArray(): array
    {
        if ($this->metadataBySampleCache === null) {
            $this->collectMetadataBySample();
        }

        return $this->metadataBySampleCache;
    }

    /**
     * Collect metadata by sample.
     */
    private function collectMetadataBySample(): void
    {
        $this->metadataBySampleCache = [];
        foreach ($this->sampleNames as $sample) {
            $this->metadataBySampleCache[$sample] = [];
            foreach ($this->metadataVariableNames as $variable) {
                $this->metadataBySampleCache[$sample][$variable] = $this->metadata[$variable][$sample] ?? null;
            }
        }
    }
}
