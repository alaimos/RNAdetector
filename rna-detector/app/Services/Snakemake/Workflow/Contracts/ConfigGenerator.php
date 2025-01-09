<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use ArrayAccess;
use Illuminate\Contracts\Config\Repository as ConfigContract;
use Illuminate\Contracts\Support\Arrayable;

/**
 * @extends Arrayable<string, mixed>
 */
interface ConfigGenerator extends Arrayable
{
    /**
     * The name of the file to write the configuration to.
     */
    public string $file {
        get;
    }

    /**
     * An array of default values to use when generating the configuration.
     *
     * @var array<string, mixed>
     */
    public array $defaults {
        get;
    }

    /**
     * Convert an array to a Config Generator instance.
     *
     * @param  array<string, mixed>  $data
     */
    public static function from(array $data): static;

    /**
     * Set the data files for the workflow.
     */
    public function withDataFiles(WorkflowDataFiles $dataFiles): self;

    /**
     * Set the datasets for the workflow.
     */
    public function withDatasets(WorkflowDatasets $datasets): self;

    /**
     * Set the metadata for the workflow.
     */
    public function withMetadata(WorkflowMetadata $metadata): self;

    /**
     * Set the parameters for the workflow.
     *
     * @param  ArrayAccess<string, mixed>&ConfigContract  $params
     */
    public function withParams(ArrayAccess&ConfigContract $params): self;

    public function write(): void;
}
