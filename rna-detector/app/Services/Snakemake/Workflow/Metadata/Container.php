<?php

namespace App\Services\Snakemake\Workflow\Metadata;

use ArrayAccess;
use Countable;
use Exception;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Support\Arr;
use IteratorAggregate;
use JsonSerializable;
use Override;
use Traversable;

/**
 * A container for metadata for a workflow.
 * The metadata is an array where the keys are the metadata variable names, and the values are arrays where
 * the keys are sample names and the values are the metadata values.
 *
 * @implements ArrayAccess<string, array<string, mixed>>
 * @implements \IteratorAggregate<string, array<string, mixed>>
 */
class Container implements Countable, IteratorAggregate, Jsonable, JsonSerializable
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

        return $this;
    }

    /**
     * Retrieve an external iterator
     *
     * @link https://php.net/manual/en/iteratoraggregate.getiterator.php
     *
     * @return Traversable<string, array<string, mixed>> An instance of an object implementing <b>Iterator</b> or
     *                                                   <b>Traversable</b>
     *
     * @throws Exception on failure.
     */
    #[Override]
    public function getIterator(): Traversable
    {
        yield from $this->metadata;
    }

    /**
     * Count elements of an object
     *
     * @link https://php.net/manual/en/countable.count.php
     *
     * @return int<0,max> The custom count as an integer.
     *                    <p>
     *                    The return value is cast to an integer.
     *                    </p>
     */
    #[Override]
    public function count(): int
    {
        return count($this->metadata);
    }

    /**
     * Convert the object to its JSON representation.
     *
     * @param  int  $options
     * @return string
     */
    #[Override]
    public function toJson($options = 0)
    {
        // TODO: Implement toJson() method.
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @link https://php.net/manual/en/jsonserializable.jsonserialize.php
     *
     * @return array data which can be serialized by <b>json_encode</b>,
     *               which is a value of any type other than a resource.
     *
     * @since 5.4
     */
    #[Override]
    public function jsonSerialize(): array
    {
        return $this->metadata;
    }

    /**
     * Initialize the metadata variable names and sample names.
     */
    private function initializeNames(): void
    {
        $this->metadataVariableNames = array_keys($this->metadata);
        $this->sampleNames = array_unique(Arr::flatten(
            Arr::map($this->metadata, static fn ($metadata) => array_keys($metadata))
        ));
    }
}
