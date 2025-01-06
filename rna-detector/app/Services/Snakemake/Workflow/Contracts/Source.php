<?php

namespace App\Services\Snakemake\Workflow\Contracts;

use App\Services\Mamba\Contracts\Logger;
use Illuminate\Contracts\Support\Arrayable;

/**
 * A source is a way to load a workflow into the application.
 * This could be from a local directory, a git repository, or a remote URL.
 *
 * @extends Arrayable<string, mixed>
 */
interface Source extends Arrayable
{
    /**
     * Get the type of the source.
     * This is used by the factory to determine which source to create.
     */
    public static function type(): string;

    /**
     * Convert an array to a Source instance. For example, when loading from a JSON
     * file, the JSON is decoded to an array and then converted to a Source instance.
     *
     * @param  array<string, mixed>  $data
     */
    public static function from(array $data): static;

    /**
     * Pull the workflow from the source and save it to the destination.
     *
     * @throws \App\Services\Snakemake\Workflow\Exceptions\WorkflowPullException
     */
    public function pull(string $workflowDir, ?Logger $output = null): void;
}
