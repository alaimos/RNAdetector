<?php

namespace App\Services\DataTable\Adapters;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Adapter;
use App\Services\DataTable\Pipes\Collection\ColumnFilter;
use App\Services\DataTable\Pipes\Collection\GlobalFilter;
use App\Services\DataTable\Pipes\Collection\Pagination;
use App\Services\DataTable\Pipes\Collection\Sorting;
use Illuminate\Support\Collection;
use Override;

/**
 * @implements Adapter<Collection,\Closure(mixed,string):bool,array<string,mixed>>
 */
class CollectionAdapter implements Adapter
{
    /**
     * @var array{globalFilterColumns: array<string,\Closure(mixed,string):bool>, columnFilter: array<string,\Closure(Collection, array<string>):Collection>, sortableColumns: array<string>}
     */
    private array $config = [
        'globalFilterColumns' => [],
        'columnFilter'        => [],
        'sortableColumns'     => [],
    ];

    /**
     * Make a new adapter instance with the given configuration.
     *
     * @param  array{globalFilterColumns?: array<string,\Closure(mixed,string):bool>, columnFilter?: array<string,\Closure(Collection, array<string>):Collection>, sortableColumns?: array<string>} $config
     */
    #[Override]
    public static function make(array $config): self
    {
        return new self()->configure($config);
    }

    /**
     * Set the adapter configuration.
     *
     * @param  array{globalFilterColumns?: array<string,\Closure(mixed,string):bool>, columnFilter?: array<string,\Closure(Collection, array<string>):Collection>, sortableColumns?: array<string>} $config
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
     * @return array<\App\Services\DataTable\Contracts\Pipe<Collection>>
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
     * @return array<\App\Services\DataTable\Contracts\Pipe<Collection>>
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
     * @param \Illuminate\Support\Collection $builder
     * @return \Illuminate\Support\Collection<array<string,mixed>>
     */
    #[Override]
    public function adaptOutput($builder, DataTableRequest $request): Collection
    {
        return $builder->values();
    }

    /**
     * @param \Illuminate\Support\Collection $builder
     */
    #[Override]
    public function getCount($builder, DataTableRequest $request): int
    {
        return $builder->count();
    }
}
