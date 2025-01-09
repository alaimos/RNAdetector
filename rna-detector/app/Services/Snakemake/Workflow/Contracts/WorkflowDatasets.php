<?php

namespace App\Services\Snakemake\Workflow\Contracts;

interface WorkflowDatasets
{
    /**
     * A list of datasets with their associated data models
     *
     * @var \App\Services\Snakemake\Workflow\Contracts\PulledDataset[]
     */
    public array $datasets {
        get;
    }

    /**
     * A map from data name to dataset identifier.
     *
     * @var array<string, string>
     */
    public array $samplesMap {
        get;
    }

    /**
     * Make a new instance from a list of datasets and a samples map.
     *
     * @param  \App\Services\Snakemake\Workflow\Contracts\PulledDataset[]  $datasets
     * @param  array<string, string>  $samplesMap
     */
    public static function from(array $datasets, array $samplesMap): static;

    /**
     * Merge another set of datasets into this one.
     *
     * @return $this
     */
    public function merge(WorkflowDatasets $datasets): self;
}
