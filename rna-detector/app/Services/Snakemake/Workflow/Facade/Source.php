<?php

namespace App\Services\Snakemake\Workflow\Facade;

use App\Services\Snakemake\Workflow\Sources\Factory;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\Snakemake\Workflow\Contracts\Source from(array $data)
 *
 * @see \App\Services\Snakemake\Workflow\Sources\Factory
 */
class Source extends Facade
{
    /**
     * Get the registered name of the component.
     */
    #[\Override]
    protected static function getFacadeAccessor(): string
    {
        return Factory::class;
    }
}
