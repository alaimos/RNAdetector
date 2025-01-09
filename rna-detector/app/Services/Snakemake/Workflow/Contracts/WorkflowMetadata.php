<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use ArrayAccess;

interface WorkflowMetadata extends ArrayAccess
{
    /**
     * An array of metadata for the workflow.
     * The array keys are the metadata variable names, and the values are arrays where
     * the keys are sample names and the values are the metadata values.
     *
     * @var array<string, array<string, mixed>>
     */
    public array $metadata {
        get;
    }

    /**
     * Make a new instance from an array of metadata or
     * a metadata reader object.
     *
     * @TODO Define the metadata reader object.
     *
     * @param  array<string, array<string, mixed>>|object  $metadata
     */
    public static function from(array|object $metadata): static;

    /**
     * Merge another set of metadata into this one.
     *
     * @return $this
     */
    public function merge(WorkflowMetadata $datasets): self;
}
