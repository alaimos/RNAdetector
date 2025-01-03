<?php

namespace App\Services\DataTable\Pipes\Collection;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Support\Collection;

/**
 * @implements Pipe<\Illuminate\Support\Collection>
 */
readonly class GlobalFilter implements Pipe
{
    /**
     * @param  array<string, \Closure(mixed $value, string $filter): bool>  $config
     */
    public function __construct(private DataTableRequest $request, private array $config) {}

    /**
     * @param  \Illuminate\Support\Collection  $builder
     * @param  \Closure(\Illuminate\Support\Collection):\Illuminate\Support\Collection  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Collection
    {
        $globalFilter = $this->request->global_filter;
        if ($globalFilter) {
            $builder = $builder->filter(fn ($row) => array_any($this->config, static fn ($filter, $column) => $filter($row[$column], $globalFilter)));
        }

        return $next($builder);
    }
}
