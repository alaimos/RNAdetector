<?php

namespace App\Services\Snakemake\Workflow\Contracts;

interface WorkflowDataFiles
{
    /**
     * A list of data files for the workflow.
     * The contents of the array are a map from internal data type to a list of
     * data files for that type. The list of data files is a map from data name
     * to the path of the data file relative to the workflow directory.
     *
     * @var array<string, array<string, string>>
     */
    public array $dataFiles {
        get;
    }

    /**
     * Make a new instance from a list of data files.
     *
     * @param  array<string, array<string, string>>  $dataFiles
     */
    public static function from(array $dataFiles): static;

    /**
     * Merge another set of data files into this one.
     *
     * @return $this
     */
    public function merge(WorkflowDataFiles $dataFiles): self;
}
