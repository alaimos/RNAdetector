<?php

namespace App\Services\DataFiles;

use App\Services\DataFiles\Contracts\DataType;
use Illuminate\Support\Arr;
use Override;

class DataTypeRepository implements Contracts\DataTypeRepository
{
    /**
     * The data types.
     *
     * @var array<string, \App\Services\DataFiles\Contracts\DataType>
     */
    private array $dataTypes = [];

    /**
     * Whether a offset exists
     *
     * @link https://php.net/manual/en/arrayaccess.offsetexists.php
     *
     * @param  mixed  $offset  <p>
     *                         An offset to check for.
     *                         </p>
     * @return bool true on success or false on failure.
     *              </p>
     *              <p>
     *              The return value will be casted to boolean if non-boolean was returned.
     */
    #[Override]
    public function offsetExists(mixed $offset): bool
    {
        return $this->has($offset);
    }

    /**
     * Offset to retrieve
     *
     * @link https://php.net/manual/en/arrayaccess.offsetget.php
     *
     * @param  string  $offset  <p>
     *                          The offset to retrieve.
     *                          </p>
     * @return DataType|null Can return all value types.
     */
    #[Override]
    public function offsetGet(mixed $offset): ?DataType
    {
        return $this->get($offset);
    }

    /**
     * Offset to set
     *
     * @link https://php.net/manual/en/arrayaccess.offsetset.php
     *
     * @param  string  $offset  <p>
     *                          The offset to assign the value to.
     *                          </p>
     * @param  DataType|array  $value  <p>
     *                                 The value to set.
     *                                 </p>
     */
    #[Override]
    public function offsetSet(mixed $offset, mixed $value): void
    {
        $this->register($value);
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
        $this->forget($offset);
    }

    /**
     * Determine if the given data type exists.
     */
    #[Override]
    public function has(string $key): bool
    {
        return Arr::exists($this->dataTypes, $key);
    }

    /**
     * Get the specified data type.
     */
    #[Override]
    public function get(string $key): ?DataType
    {
        return Arr::get($this->dataTypes, $key);
    }

    /**
     * Get all the data types.
     *
     * @return array<string, \App\Services\DataFiles\Contracts\DataType>
     */
    #[Override]
    public function all(): array
    {
        return $this->dataTypes;
    }

    /**
     * Register a data type.
     */
    #[Override]
    public function register(array|DataType $dataType): void
    {
        if (is_array($dataType)) {
            $dataType = GenericDataType::from($dataType);
        }

        Arr::set($this->dataTypes, $dataType->slug, $dataType);
    }

    /**
     * Deregister a data type.
     */
    #[Override]
    public function forget(string $key): void
    {
        Arr::forget($this->dataTypes, $key);
    }
}
