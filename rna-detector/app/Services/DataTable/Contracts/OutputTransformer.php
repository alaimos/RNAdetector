<?php

namespace App\Services\DataTable\Contracts;

/**
 * @template Input
 * @template Output
 */
interface OutputTransformer
{
    /**
     * Transforms the input into an output.
     *
     * @param  Input  $input
     * @return Output
     */
    public function __invoke($input);
}
