<?php

namespace App\Services\Metadata\Facades;

use App\Services\Metadata\Readers\Factory as ReadersFactory;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\Metadata\Contracts\Reader from(string $extension, array $options = [])
 * @method static \App\Services\Metadata\Container read(string $filename, array $options = [])
 *
 * @see \App\Services\Metadata\Readers\Factory
 */
class Readers extends Facade
{
    /**
     * Get the registered name of the component.
     */
    #[\Override]
    protected static function getFacadeAccessor(): string
    {
        return ReadersFactory::class;
    }
}
