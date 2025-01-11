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
 * The keys are sample names and the values are the path of the data file relative to the workflow directory.
 *
 * @implements \ArrayAccess<string, string>
 * @implements \IteratorAggregate<string, string>
 * @implements Arrayable<string, string>
 */
class CollectedDataFilesContainer implements Arrayable, ArrayAccess, Countable, IteratorAggregate
{
    /**
     * An array of data files for the workflow.
     * The array keys are sample names and the values are the path of the data
     * file relative to the workflow directory.
     *
     * @var array<string, string>
     */
    protected array $dataFiles;

    /**
     * Create a new instance.
     *
     * @param  array<string, string>  $dataFiles
     */
    public function __construct(array $dataFiles)
    {
        $this->dataFiles = $dataFiles;
    }

    /**
     * Make a new instance from a list of data files.
     *
     * @param  array<string, string>  $dataFiles
     */
    public static function from(array $dataFiles): static
    {
        return new static($dataFiles); // @phpstan-ignore-line
    }

    /**
     * Merge another set of data files into this one.
     */
    public function merge(CollectedDataFilesContainer $dataFiles): self
    {
        foreach ($dataFiles->dataFiles as $sample => $dataFile) {
            $this->dataFiles[$sample] = $dataFile;
        }

        return $this;
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
     * @return string Can return all value types.
     */
    #[Override]
    public function offsetGet(mixed $offset): string
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
     * @param  string  $value  <p>
     *                         The value to set.
     *                         </p>
     */
    #[Override]
    public function offsetSet(mixed $offset, mixed $value): void
    {
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
     * @return array<string, string>
     */
    #[Override]
    public function toArray(): array
    {
        return $this->dataFiles;
    }
}
