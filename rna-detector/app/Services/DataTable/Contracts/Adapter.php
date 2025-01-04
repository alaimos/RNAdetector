<?php

namespace App\Services\DataTable\Contracts;

use App\Http\Requests\DataTableRequest;
use Illuminate\Support\Collection;

/**
 * @template T
 * @template U of \Closure
 * @template O
 */
interface Adapter
{
    /**
     * Make a new adapter instance with the given configuration.
     *
     * @param  array{globalFilterColumns?: array<string,U>, columnFilter?: array<string,\Closure(T $builder,array<string> $value):T>,
     *     sortableColumns?: array<string>}  $config
     */
    public static function make(array $config): self;

    /**
     * Set the adapter configuration.
     *
     * @param  array{globalFilterColumns?: array<string,U>, columnFilter?: array<string,\Closure(T $builder,array<string> $value):T>,
     *     sortableColumns?: array<string>}  $config
     */
    public function configure(array $config): self;

    /**
     * Get the filter pipes (for example, column or global filtering).
     *
     * @return array<Pipe<T>>
     */
    public function getFilterPipes(DataTableRequest $request): array;

    /**
     * Get the output pipes (for example, pagination or sorting).
     *
     * @return array<Pipe<T>>
     */
    public function getOutputPipes(DataTableRequest $request): array;

    /**
     * Adapt the output.
     *
     * @param  T  $builder
     * @return Collection<O>
     */
    public function adaptOutput($builder, DataTableRequest $request): Collection;

    /**
     * Get the count of elements from a builder.
     *
     * @param  T  $builder
     */
    public function getCount($builder, DataTableRequest $request): int;
}
