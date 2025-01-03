<?php

namespace App\Services\DataTable\Contracts;

/**
 * @template Builder
 */
interface Pipe
{
    /**
     * Parse the incoming request and apply it to the builder.
     *
     * @param  Builder  $builder
     * @param  \Closure(Builder): Builder  $next
     * @return Builder
     */
    public function __invoke($builder, \Closure $next);
}
