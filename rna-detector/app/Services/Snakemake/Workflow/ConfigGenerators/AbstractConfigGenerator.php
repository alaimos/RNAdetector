<?php

namespace App\Services\Snakemake\Workflow\ConfigGenerators;

use App\Services\Snakemake\Workflow\Contracts\ConfigGenerator;
use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Snakemake\Workflow\Data\CollectedDataFiles;
use App\Services\Snakemake\Workflow\WorkflowDatasets;
use Illuminate\Config\Repository as ConfigRepository;
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
    public protected(set) MetadataContainer $metadata;

    /**
     * The parameters for the workflow.
     *
     * @var ConfigRepository
     */
    public protected(set) ConfigRepository $params;

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
    public function withMetadata(MetadataContainer $metadata): self
    {
        $this->metadata = $metadata;

        return $this;
    }

    /**
     * Set the parameters for the workflow.
     *
     * @param  ConfigRepository  $params
     */
    #[Override]
    public function withParams(ConfigRepository $params): self
    {
        $this->params = $params;

        return $this;
    }
}
