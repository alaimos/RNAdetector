<?php

namespace App\Services\Snakemake\Workflow\Sources;

use App\Services\Mamba\Contracts\Logger;
use App\Services\Snakemake\Workflow\Contracts\Source;
use App\Services\Snakemake\Workflow\Exceptions\WorkflowPullException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Override;

class Local implements Source
{
    /**
     * Create a new local source instance.
     *
     * @param  string  $name  The name of the local directory in the local workflow repository.
     */
    final public function __construct(
        public string $name,
    ) {}

    /**
     * Get the instance as an array.
     *
     * @return array<string, mixed>
     */
    #[Override]
    public function toArray(): array
    {
        return [
            'type' => self::type(),
            'name' => $this->name,
        ];
    }

    /**
     * Get the type of the source.
     * This is used by the factory to determine which source to create.
     */
    #[Override]
    public static function type(): string
    {
        return 'local';
    }

    /**
     * Convert an array to a Source instance. For example, when loading from a JSON
     * file, the JSON is decoded to an array and then converted to a Source instance.
     *
     * @param  array<string, mixed>  $data
     */
    #[Override]
    public static function from(array $data): static
    {
        $validData = Validator::make($data, [
            'name' => 'required|string',
        ])->validate();

        return new static($validData['name']);
    }

    /**
     * Pull the workflow from the source and save it to the destination.
     *
     * @throws \App\Services\Snakemake\Workflow\Exceptions\WorkflowPullException
     * @throws \Throwable
     */
    #[Override]
    public function pull(string $workflowDir, ?Logger $output = null): void
    {
        $output?->output("Copying the workflow {$this->name} from the local source...");
        $sourceDir = config('rnadetector.local_workflow_repository_path').'/'.$this->name;
        $result = File::copyDirectory(storage_path($sourceDir), $workflowDir);
        if (! $result || ! File::exists($workflowDir)) {
            throw new WorkflowPullException('Failed to copy the workflow from the local source.');
        }
        $output?->output("done.\n");
    }
}
