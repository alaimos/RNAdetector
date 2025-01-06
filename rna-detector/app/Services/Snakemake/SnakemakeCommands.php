<?php

namespace App\Services\Snakemake;

use App\Services\Mamba\Command\Command;
use App\Services\Mamba\Contracts\Logger;
use App\Services\Mamba\Environment;
use App\Services\Mamba\Facade\Mamba;
use Illuminate\Process\InvokedProcess;

class SnakemakeCommands
{
    private Environment $environment;

    public function __construct()
    {
        $this->environment = Mamba::environment(config('rnadetector.snakemake_env'));
    }

    // TODO: add more methods here...just thinking about the structure for now

    public function pullWorkflow(
        string $repository,
        string $destination,
        ?string $tag = null,
        ?string $branch = null,
        ?Logger $output = null
    ): InvokedProcess {
        return $this->environment->start(
            fn (Command $command) => $command
                ->call(['snakedeploy', 'deploy-workflow'])
                ->withPositionalArguments([$repository, $destination])
                ->when($tag)->withFlag('--tag', $tag)
                ->when($branch)->withFlag('--branch', $branch),
            $output
        );
    }
    //
    //    public function runWorkflow(
    //        string $workflowDir, ?int $cores = -1, ?callable $output = null, ?bool $debug = false
    //    ): InvokedProcess {
    //        // TODO implement this method
    //    }

}
