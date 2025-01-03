<?php

namespace App\Services\DataTable\Pipes\Eloquent;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Database\Eloquent\Builder;

/**
 * @implements Pipe<\Illuminate\Database\Eloquent\Builder>
 */
readonly class GlobalFilter implements Pipe
{
    /**
     * @param  array<string, \Closure(Builder $builder, string $filter, string $column): void>  $config
     */
    public function __construct(private DataTableRequest $request, private array $config) {}

    /**
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Closure(\Illuminate\Database\Eloquent\Builder):\Illuminate\Database\Eloquent\Builder  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Builder
    {
        $globalFilter = $this->request->global_filter;
        if ($globalFilter) {
            $builder = $builder->where(function (Builder $internal) use ($globalFilter) {
                foreach ($this->config as $column => $filter) {
                    $filter($internal, $globalFilter, $column);
                }
            });
        }

        return $next($builder);
    }
}
