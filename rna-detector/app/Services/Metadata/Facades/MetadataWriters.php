<?php

namespace App\Services\Metadata\Facades;

use App\Services\Metadata\Writers\Factory as WritersFactory;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\Metadata\Contracts\Writer from(string $extension, array $options = [])
 * @method static void read(string $filename, \App\Services\Metadata\Container $container, array $options = [])
 *
 * @see \App\Services\Metadata\Writers\Factory
 */
class MetadataWriters extends Facade
{
    /**
     * Get the registered name of the component.
     */
    #[\Override]
    protected static function getFacadeAccessor(): string
    {
        return WritersFactory::class;
    }
}
