<?php

namespace App\Services\DataFiles\Contracts;

use ArrayAccess;

/**
 * @extends  ArrayAccess<string, \App\Services\DataFiles\Contracts\DataType>
 */
interface DataTypeRepository extends ArrayAccess
{
    /**
     * Determine if the given data type exists.
     */
    public function has(string $key): bool;

    /**
     * Get the specified data type.
     */
    public function get(string $key): ?DataType;

    /**
     * Get all the data types.
     *
     * @return array<string, \App\Services\DataFiles\Contracts\DataType>
     */
    public function all(): array;

    /**
     * Register a data type.
     */
    public function register(DataType|array $dataType): void;

    /**
     * Remove a data type.
     */
    public function forget(string $key): void;
}
