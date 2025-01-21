<?php

namespace App\Services\Snakemake\Workflow;

use App\Models\Analysis;
use App\Services\Snakemake\Workflow\Contracts\WorkflowRegistry;
use Closure;
use Illuminate\Config\Repository;

class Workflow
{
    /**
     * @param  \Closure(string):void  $progressCallback
     */
    public function __construct(
        protected Descriptor $descriptor,
        protected Repository $params,
        protected string $workflowPath,
        protected Closure $progressCallback,
    ) {}

    public static function from(Analysis $analysis): static
    {
        $registry = app(WorkflowRegistry::class);
        if (! isset($registry[$analysis->type])) {
            throw new \InvalidArgumentException("Workflow type [{$analysis->type}] is not supported.");
        }
        $descriptor = $registry[$analysis->type];
        $parameters = $analysis->parameters?->toArray() ?? []; // @phpstan-ignore-line
        $params = new Repository($parameters);
        $workflowPath = ''; // todo: implement
        $progressCallback = fn (string $message) => logger()->info($message); // todo: implement

        return new static($descriptor, $params, $workflowPath, $progressCallback); // @phpstan-ignore-line
    }

    public function prepare(): self
    {
        // todo: implement
        return $this;
    }

    public function run(?int $cores = null): self
    {
        // todo: implement
        return $this;
    }

    public function archive(string $archivePath): self
    {
        // todo: implement
        return $this;
    }

    public function cleanup(): self
    {
        // todo: implement
        return $this;
    }

    public function remove(): self
    {
        // todo: implement
        return $this;
    }
}
