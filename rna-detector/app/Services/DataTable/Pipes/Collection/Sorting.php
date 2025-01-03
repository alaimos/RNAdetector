<?php

namespace App\Services\DataTable\Pipes\Collection;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Support\Collection;

/**
 * @implements Pipe<\Illuminate\Support\Collection>
 */
readonly class Sorting implements Pipe
{
    /**
     * @param  array<string>  $sortableColumns
     */
    public function __construct(private DataTableRequest $request, private array $sortableColumns) {}

    /**
     * @param  \Illuminate\Support\Collection  $builder
     * @param  \Closure(\Illuminate\Support\Collection):\Illuminate\Support\Collection  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Collection
    {
        $sorting = $this->request->sorting;
        if ($sorting) {
            foreach ($sorting as $column => $direction) {
                if (in_array($column, $this->sortableColumns, true)) {
                    $builder = $builder->sortBy($column, SORT_REGULAR, $direction === 'asc');
                }
            }
        }

        return $next($builder);
    }
}
