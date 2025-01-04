<?php

namespace App\Services\DataTable\Adapters;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Adapter;
use App\Services\DataTable\Pipes\Eloquent\ColumnFilter;
use App\Services\DataTable\Pipes\Eloquent\GlobalFilter;
use App\Services\DataTable\Pipes\Eloquent\Pagination;
use App\Services\DataTable\Pipes\Eloquent\Sorting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Override;

/**
 * @template Model of \Illuminate\Database\Eloquent\Model
 * @implements Adapter<Builder,\Closure(Builder $builder, string $filter, string $column): void, Model>
 */
class EloquentAdapter implements Adapter
{
    /**
     * @var array{globalFilterColumns: array<string,\Closure(Builder $builder, string $filter, string $column): void>, columnFilter: array<string,\Closure(Builder, array<string>):Builder>, sortableColumns: array<string>}
     */
    private array $config = [
        'globalFilterColumns' => [],
        'columnFilter'        => [],
        'sortableColumns'     => [],
    ];

    /**
     * Make a new adapter instance with the given configuration.
     *
     * @param  array{globalFilterColumns?: array<string,\Closure(Builder $builder, string $filter, string $column): void>, columnFilter?: array<string,\Closure(Builder, array<string>):Builder>, sortableColumns?: array<string>} $config
     */
    #[Override]
    public static function make(array $config): self
    {
        return new self()->configure($config);
    }

    /**
     * Set the adapter configuration.
     *
     * @param  array{globalFilterColumns?: array<string,\Closure(Builder $builder, string $filter, string $column): void>, columnFilter?: array<string,\Closure(Builder, array<string>):Builder>, sortableColumns?: array<string>} $config
     */
    #[Override]
    public function configure(array $config): self
    {
        $this->config = [
            'globalFilterColumns' => $config['globalFilterColumns'] ?? [],
            'columnFilter'        => $config['columnFilter'] ?? [],
            'sortableColumns'     => $config['sortableColumns'] ?? [],
        ];

        return $this;
    }

    /**
     * Get the filter pipes.
     *
     * @return array<\App\Services\DataTable\Contracts\Pipe<Builder>>
     */
    #[Override]
    public function getFilterPipes(DataTableRequest $request): array
    {
        return [
            new GlobalFilter($request, $this->config['globalFilterColumns']),
            new ColumnFilter($request, $this->config['columnFilter']),
        ];
    }

    /**
     * Get the output pipes.
     *
     * @return array<\App\Services\DataTable\Contracts\Pipe<Builder>>
     */
    #[Override]
    public function getOutputPipes(DataTableRequest $request): array
    {
        return [
            new Sorting($request, $this->config['sortableColumns']),
            new Pagination($request),
        ];
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder $builder
     * @return \Illuminate\Database\Eloquent\Collection<\Illuminate\Database\Eloquent\Model>
     */
    #[Override]
    public function adaptOutput($builder, DataTableRequest $request): Collection
    {
        return $builder->get();
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder $builder
     */
    #[Override]
    public function getCount($builder, DataTableRequest $request): int
    {
        return $builder->count();
    }
}
