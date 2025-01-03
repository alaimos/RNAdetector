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
        $page = (int) ($this->request->page ?? 1);
        $perPage = (int) ($this->request->per_page ?? 10);

        return $next($builder->forPage($page, $perPage));
    }
}
