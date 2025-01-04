<?php

namespace App\Services\DataTable\Pipes\Eloquent;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Pipe;
use Illuminate\Database\Eloquent\Builder;

/**
 * @implements Pipe<\Illuminate\Database\Eloquent\Builder>
 */
readonly class Pagination implements Pipe
{
    public function __construct(private DataTableRequest $request) {}

    /**
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Closure(\Illuminate\Database\Eloquent\Builder):\Illuminate\Database\Eloquent\Builder  $next
     */
    #[\Override]
    public function __invoke($builder, \Closure $next): Builder
    {
        return $next($builder->forPage($this->request->page, $this->request->per_page));
    }
}
