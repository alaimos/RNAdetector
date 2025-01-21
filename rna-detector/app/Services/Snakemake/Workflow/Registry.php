<?php

namespace App\Services\Snakemake\Workflow;

use ArrayAccess;
use InvalidArgumentException;
use Override;

/**
 * Registry for workflow descriptors.
 *
 * @implements ArrayAccess<string, Descriptor>
 */
final class Registry implements ArrayAccess
{
    /**
     * Array of workflow descriptors.
     *
     * @var array<string, Descriptor>
     */
    private array $workflowDescriptors = [];

    /**
     * Add a workflow descriptor to the registry.
     */
    public function registerWorkflowDescriptor(string $name, Descriptor $workflowDescriptor): void
    {
        $this->workflowDescriptors[$name] = $workflowDescriptor;
    }

    /**
     * Get a workflow descriptor from the registry.
     */
    public function get(string $name): Descriptor
    {
        if (! array_key_exists($name, $this->workflowDescriptors)) {
            throw new InvalidArgumentException("Workflow descriptor with name '{$name}' not found.");
        }

        return $this->workflowDescriptors[$name];
    }

    /**
     * Delete a workflow descriptor from the registry.
     */
    public function deleteWorkflowDescriptor(string $name): void
    {
        if (! array_key_exists($name, $this->workflowDescriptors)) {
            throw new InvalidArgumentException("Workflow descriptor with name '{$name}' not found.");
        }
        unset($this->workflowDescriptors[$name]);
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public function offsetExists(mixed $offset): bool
    {
        return array_key_exists($offset, $this->workflowDescriptors);
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public function offsetGet(mixed $offset): Descriptor
    {
        return $this->get($offset);
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public function offsetSet(mixed $offset, mixed $value): void
    {
        $this->registerWorkflowDescriptor($offset, $value);
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public function offsetUnset(mixed $offset): void
    {
        $this->deleteWorkflowDescriptor($offset);
    }
}
