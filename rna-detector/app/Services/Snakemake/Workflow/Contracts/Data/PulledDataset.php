<?php

namespace App\Services\Snakemake\Workflow\Contracts\Data;

use App\Models\Dataset;
use App\Models\DataType;
use App\Services\Snakemake\Workflow\Data\CollectedDataFiles;

interface PulledDataset
{
    /**
     * A dataset to use in the workflow.
     */
    public Dataset $dataset {
        get;
    }

    /**
     * The data pulled from the dataset.
     *
     * @var \App\Models\Data[]
     */
    public array $data {
        get;
    }

    /**
     * An instance of a data path resolver.
     */
    public DataPathResolver $dataPathResolver {
        get;
    }

    /**
     * Create a new Workflow Dataset instance from a dataset and an optional data type.
     * The workflow should be preloaded with all its data to avoid unnecessary database queries.
     * The data type can be a string (data type slug), an integer (data type ID), a DataType instance, or
     * an array of these values.
     *
     * @param  int|string|DataType|array<int|string|DataType>|null  $dataType
     */
    public static function from(Dataset $dataset, DataPathResolver $dataPathResolver, int|string|DataType|array|null $dataType = null): static;

    /**
     * Collect and links the data files from the dataset.
     */
    public function collectDataFiles(string $workflowDir): CollectedDataFiles;
}
