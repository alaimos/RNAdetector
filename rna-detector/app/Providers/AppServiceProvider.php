<?php

namespace App\Providers;

use App\Services\DataFiles\Contracts\DataTypeRepository as DataRepositoryContract;
use App\Services\DataFiles\DataTypeRepository;
use App\Services\Mamba\MambaService;
use App\Services\Snakemake\SnakemakeCommands;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        MambaService::registerProcessHandler();
        $this->app->scoped('snakemake.commands', fn () => new SnakemakeCommands);
        $this->app->scoped(DataRepositoryContract::class, fn () => new DataTypeRepository);
    }
}
