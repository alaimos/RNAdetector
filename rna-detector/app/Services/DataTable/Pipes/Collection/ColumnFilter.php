<?php

namespace App\Services\DataTable\Pipes\Collection;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Support\Collection;

/**
 * @implements Pipe<\Illuminate\Support\Collection>
 */
readonly class ColumnFilter implements Pipe
{
    /**
     * @param  array<string, \Closure(Collection $collection, string|array<string> $value): Collection>  $config
     */
    public function __construct(private DataTableRequest $request, private array $config) {}

    /**
     * @param  \Illuminate\Support\Collection  $builder
     * @param  \Closure(\Illuminate\Support\Collection):\Illuminate\Support\Collection  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Collection
    {
        $columnFilters = $this->request->column_filters;
        foreach ($columnFilters as $column => $value) {
            if (isset($this->config[$column])) {
                $builder = $this->config[$column]($builder, $value);
            }
        }

        return $next($builder);
    }
}
