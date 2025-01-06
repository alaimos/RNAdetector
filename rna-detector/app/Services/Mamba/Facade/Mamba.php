<?php

namespace App\Services\Mamba\Facade;

use App\Services\Mamba\MambaService;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\Mamba\Environment create(string $name)
 * @method static \App\Services\Mamba\Environment environment(string $name)
 * @method static string[] environments()
 *
 * @see \App\Services\Mamba\MambaService
 */
class Mamba extends Facade
{
    /**
     * Get the registered name of the component.
     */
    #[\Override]
    protected static function getFacadeAccessor(): string
    {
        return MambaService::class;
    }
}
