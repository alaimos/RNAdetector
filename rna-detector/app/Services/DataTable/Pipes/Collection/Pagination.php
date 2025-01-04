<?php

namespace App\Services\DataTable\Pipes\Collection;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Support\Collection;

/**
 * @implements Pipe<\Illuminate\Support\Collection>
 */
readonly class Pagination implements Pipe
{
    public function __construct(private DataTableRequest $request) {}

    /**
     * @param  \Illuminate\Support\Collection  $builder
     * @param  \Closure(\Illuminate\Support\Collection):\Illuminate\Support\Collection  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Collection
    {
        return $next($builder->forPage($this->request->page, $this->request->per_page));
    }
}
