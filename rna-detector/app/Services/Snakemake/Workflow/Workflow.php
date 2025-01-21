<?php

namespace App\Services\Snakemake\Workflow;

use App\Models\Analysis;
use Closure;

class Workflow
{
    /**
     * @param  \Closure(string):void  $progressCallback
     */
    public function __construct(
        protected Descriptor $descriptor,
        protected mixed $params, // todo: define the type
        protected string $workflowPath,
        protected Closure $progressCallback,
    ) {}

    public static function from(Analysis $analysis): static
    {
        // todo: implement
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
