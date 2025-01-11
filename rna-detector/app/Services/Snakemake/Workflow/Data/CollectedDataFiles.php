<?php

namespace App\Services\Snakemake\Workflow\Data;

use ArrayAccess;
use Countable;
use Exception;
use Illuminate\Contracts\Support\Arrayable;
use IteratorAggregate;
use Override;
use Traversable;

/**
 * This class represents a collection of data files for a workflow.
 * The data files are grouped by type.
 * Each type of data files is stored in a container that implements the CollectedDataFilesContainer interface.
 *
 * @implements ArrayAccess<string, \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>
 * @implements IteratorAggregate<string, \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>
 * @implements Arrayable<string, \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>
 */
class CollectedDataFiles implements Arrayable, ArrayAccess, Countable, IteratorAggregate
{
    /**
     * An array containing for each type of date a container with the data files.
     *
     * @var array<string, \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>
     */
    protected array $dataFiles;

    /**
     * Create a new instance.
     *
     * @param  array<string, array|\App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>  $dataFiles
     */
    public function __construct(array $dataFiles)
    {
        $this->dataFiles = [];
        foreach ($dataFiles as $type => $container) {
            if (is_array($container)) {
                $container = new CollectedDataFilesContainer($container);
            }
            $this->dataFiles[$type] = $container;
        }
    }

    /**
     * Make a new instance from a list of data files.
     *
     * @param  array<string, array|\App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>  $dataFiles
     */
    public static function from(array $dataFiles): static
    {
        return new static($dataFiles); // @phpstan-ignore-line
    }

    /**
     * Merge another set of data files into this one.
     */
    public function merge(CollectedDataFiles $dataFiles): self
    {
        foreach ($dataFiles->dataFiles as $type => $container) {
            if (! isset($this->dataFiles[$type])) {
                $this->dataFiles[$type] = $container;
            } else {
                $this->dataFiles[$type]->merge($container);
            }
        }

        return $this;
    }

    /**
     * Retrieve an external iterator
     *
     * @link https://php.net/manual/en/iteratoraggregate.getiterator.php
     *
     * @throws Exception on failure.
     */
    #[Override]
    public function getIterator(): Traversable
    {
        yield from $this->dataFiles;
    }

    /**
     * Whether a offset exists
     *
     * @link https://php.net/manual/en/arrayaccess.offsetexists.php
     *
     * @param  string  $offset  <p>
     *                          An offset to check for.
     *                          </p>
     * @return bool true on success or false on failure.
     *              </p>
     *              <p>
     *              The return value will be casted to boolean if non-boolean was returned.
     */
    #[Override]
    public function offsetExists(mixed $offset): bool
    {
        return isset($this->dataFiles[$offset]);
    }

    /**
     * Offset to retrieve
     *
     * @link https://php.net/manual/en/arrayaccess.offsetget.php
     *
     * @param  string  $offset  <p>
     *                          The offset to retrieve.
     *                          </p>
     * @return \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer Can return all value types.
     */
    #[Override]
    public function offsetGet(mixed $offset): mixed
    {
        return $this->dataFiles[$offset];
    }

    /**
     * Offset to set
     *
     * @link https://php.net/manual/en/arrayaccess.offsetset.php
     *
     * @param  string  $offset  <p>
     *                          The offset to assign the value to.
     *                          </p>
     * @param  array|\App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer  $value  <p>
     *                                                                                          The value to set.
     *                                                                                          </p>
     */
    #[Override]
    public function offsetSet(mixed $offset, mixed $value): void
    {
        if (is_array($value)) {
            $value = new CollectedDataFilesContainer($value);
        }
        $this->dataFiles[$offset] = $value;
    }

    /**
     * Offset to unset
     *
     * @link https://php.net/manual/en/arrayaccess.offsetunset.php
     *
     * @param  string  $offset  <p>
     *                          The offset to unset.
     *                          </p>
     */
    #[Override]
    public function offsetUnset(mixed $offset): void
    {
        unset($this->dataFiles[$offset]);
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
        return count($this->dataFiles);
    }

    /**
     * Get the instance as an array.
     *
     * @return array<string, \App\Services\Snakemake\Workflow\Data\CollectedDataFilesContainer>
     */
    #[Override]
    public function toArray(): array
    {
        return $this->dataFiles;
    }
}
