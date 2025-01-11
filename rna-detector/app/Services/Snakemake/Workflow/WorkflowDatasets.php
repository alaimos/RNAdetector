<?php

namespace App\Services\Snakemake\Workflow;

use App\Services\Snakemake\Workflow\Data\CollectedDataFiles;
use Illuminate\Support\Arr;

class WorkflowDatasets
{
    /**
     * A list of datasets with their associated data models
     *
     * @var \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]
     */
    public private(set) array $datasets;

    /**
     * A map from data name to dataset identifier.
     *
     * @var array<string, string>
     */
    public private(set) array $samplesMap;

    /**
     * Create a new instance.
     *
     * @param  \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]  $datasets
     * @param  array<string, string>  $samplesMap
     */
    public function __construct(array $datasets, array $samplesMap)
    {
        $this->datasets = $datasets;
        $this->samplesMap = $samplesMap;
    }

    /**
     * Make a new instance from a list of datasets and a samples map.
     *
     * @param  \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]  $datasets
     */
    public static function from(array $datasets): static
    {
        return new static($datasets, static::buildSamplesMap($datasets)); // @phpstan-ignore-line
    }

    /**
     * Merge another set of datasets into this one.
     *
     * @return $this
     */
    public function merge(WorkflowDatasets $datasets): self {
        $this->datasets = array_merge($this->datasets, $datasets->datasets);
        $this->samplesMap = array_merge($this->samplesMap, $datasets->samplesMap);

        return $this;
    }

    /**
     * Collect the data files for all datasets.
     *
     * @param  string  $workflowDir
     *
     * @return \App\Services\Snakemake\Workflow\Data\CollectedDataFiles
     */
    public function collectDataFiles(string $workflowDir): CollectedDataFiles
    {
        $collectedFiles = CollectedDataFiles::from([]);
        foreach ($this->datasets as $dataset) {
            $collectedFiles->merge($dataset->collectDataFiles($workflowDir));
        }
        return $collectedFiles;
    }

    /**
     * Build a map from data name to dataset identifier.
     * @param  \App\Services\Snakemake\Workflow\Data\PulledDataset[]  $datasets
     *
     * @return array
     */
    protected static function buildSamplesMap(array $datasets): array {
        $samplesMap = [];
        foreach ($datasets as $dataset) {
            foreach ($dataset->data as $data) {
                $samplesMap[$data->name] = $dataset->dataset->id;
            }
        }
        return $samplesMap;
    }

}
