<?php

namespace App\Services\DataTable\Pipes\Eloquent;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Database\Eloquent\Builder;

/**
 * @implements Pipe<\Illuminate\Database\Eloquent\Builder>
 */
readonly class Sorting implements Pipe
{
    /**
     * @param  array<string>  $sortableColumns
     */
    public function __construct(private DataTableRequest $request, private array $sortableColumns) {}

    /**
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Closure(\Illuminate\Database\Eloquent\Builder):\Illuminate\Database\Eloquent\Builder  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Builder
    {
        $sorting = $this->request->sorting;
        if ($sorting) {
            foreach ($sorting as $column => $direction) {
                if (in_array($column, $this->sortableColumns, true)) {
                    $builder->orderBy($column, $direction);
                }
            }
        }

        return $next($builder);
    }
}
