<?php

namespace App\Services\DataTable\Pipes\Eloquent;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Database\Eloquent\Builder;

/**
 * @implements Pipe<\Illuminate\Database\Eloquent\Builder>
 */
readonly class ColumnFilter implements Pipe
{
    /**
     * @param  array<string, \Closure(Builder $collection, string|array<string> $value): Builder>  $config
     */
    public function __construct(private DataTableRequest $request, private array $config) {}

    /**
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Closure(\Illuminate\Database\Eloquent\Builder):\Illuminate\Database\Eloquent\Builder  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Builder
    {
        $columnFilters = $this->request->column_filters;
        if ($columnFilters) {
            foreach ($columnFilters as $column => $value) {
                if (isset($this->config[$column])) {
                    $builder = $this->config[$column]($builder, $value);
                }
            }
        }

        return $next($builder);
    }
}
