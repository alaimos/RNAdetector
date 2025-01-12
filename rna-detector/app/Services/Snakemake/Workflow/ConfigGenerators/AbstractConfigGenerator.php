<?php

namespace App\Services\Snakemake\Workflow\ConfigGenerators;

use App\Services\Snakemake\Workflow\Contracts\ConfigGenerator;
use App\Services\Snakemake\Workflow\Contracts\WorkflowMetadata;
use App\Services\Snakemake\Workflow\Data\CollectedDataFiles;
use App\Services\Snakemake\Workflow\WorkflowDatasets;
use ArrayAccess;
use Closure;
use Illuminate\Contracts\Config\Repository as ConfigContract;
use Override;

abstract class AbstractConfigGenerator implements ConfigGenerator
{

    /**
     * A collection of data files used by the workflow.
     */
    public protected(set) CollectedDataFiles $dataFiles;

    /**
     * The datasets used by the workflow.
     */
    public protected(set) WorkflowDatasets $datasets;

    /**
     * The metadata for the workflow.
     */
    public protected(set) WorkflowMetadata $metadata;

    /**
     * The parameters for the workflow.
     *
     * @var ArrayAccess<string, mixed>&ConfigContract
     */
    public protected(set) ArrayAccess&ConfigContract $params;

    /**
     * Set the data files for the workflow.
     */
    #[Override]
    public function withDataFiles(CollectedDataFiles $dataFiles): self
    {
        $this->dataFiles = $dataFiles;
        return $this;
    }

    /**
     * Set the datasets for the workflow.
     */
    #[Override]
    public function withDatasets(WorkflowDatasets $datasets): self
    {
        $this->datasets = $datasets;
        return $this;
    }

    /**
     * Set the metadata for the workflow.
     */
    #[Override]
    public function withMetadata(WorkflowMetadata $metadata): self
    {
        $this->metadata = $metadata;
        return $this;
    }

    /**
     * Set the parameters for the workflow.
     *
     * @param  ArrayAccess<string, mixed>&ConfigContract  $params
     */
    #[Override]
    public function withParams(ArrayAccess&ConfigContract $params): self
    {
        $this->params = $params;
        return $this;
    }
}
