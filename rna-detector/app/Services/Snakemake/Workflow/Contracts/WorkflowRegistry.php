<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use App\Services\Snakemake\Workflow\Descriptor;
use ArrayAccess;

/**
 * A registry interface for workflow descriptors.
 *
 * @extends ArrayAccess<string, Descriptor>
 */
interface WorkflowRegistry extends ArrayAccess
{
    /**
     * Add an element to the registry.
     */
    public function register(string $name, Descriptor $workflowDescriptor): void;

    /**
     * Get a workflow descriptor from the registry.
     */
    public function get(string $name): Descriptor;

    /**
     * Delete a workflow descriptor from the registry.
     */
    public function delete(string $name): void;
}
