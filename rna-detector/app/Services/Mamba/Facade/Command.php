<?php

namespace App\Services\Mamba\Facade;

use App\Services\Mamba\Command\Factory;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Services\Mamba\Command\Command generic(string|array|null $command = null)
 * @method static \App\Services\Mamba\Command\MambaCommand mamba(string|array|null $command = null, ?string $env = null)
 * @method static \App\Services\Mamba\Command\MambaRunCommand mambaRun(\App\Services\Mamba\Contracts\ConvertibleToCommand|\Closure|null $command = null, ?string $cwd = null, bool $live = false)
 * @method static \App\Services\Mamba\Command\Flags\Flag flag(string $flag, string|array|null $value = null)
 *
 * @see \App\Services\Mamba\Command\Factory
 */
class Command extends Facade
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
