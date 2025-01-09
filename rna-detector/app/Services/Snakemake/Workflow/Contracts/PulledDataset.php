<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use App\Models\Dataset;
use App\Models\DataType;

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
     * Create a new Workflow Dataset instance from a dataset and an optional data type.
     * The workflow should be preloaded with all its data to avoid unnecessary database queries.
     * The data type can be a string (data type slug), an integer (data type ID), a DataType instance, or
     * an array of these values.
     *
     * @param  int|string|DataType|array<int|string|DataType>|null  $dataType
     */
    public static function from(Dataset $dataset, int|string|DataType|array|null $dataType = null): static;
}
