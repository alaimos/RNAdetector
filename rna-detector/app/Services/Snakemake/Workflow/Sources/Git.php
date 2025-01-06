<?php

namespace App\Services\Snakemake\Workflow\Sources;

use App\Services\Mamba\Contracts\Logger;
use App\Services\Snakemake\SnakemakeCommands;
use App\Services\Snakemake\Workflow\Contracts\Source;
use App\Services\Snakemake\Workflow\Exceptions\WorkflowPullException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Override;

class Git implements Source
{
    /**
     * Create a new local source instance.
     *
     * @param  string  $repository  The name of the local directory in the local workflow repository.
     * @param  string|null  $branch  The branch to pull the workflow from.
     * @param  string|null  $tag  The tag to pull the workflow from.
     */
    final public function __construct(
        public string $repository,
        public ?string $branch = null,
        public ?string $tag = null,
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
            'repository' => $this->repository,
            'branch' => $this->branch,
            'tag' => $this->tag,
        ];
    }

    /**
     * Get the type of the source.
     * This is used by the factory to determine which source to create.
     */
    #[Override]
    public static function type(): string
    {
        return 'git';
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
            'repository' => 'required|string',
            'branch' => 'sometimes|nullable|string',
            'tag' => 'sometimes|nullable|string',
        ])->validate();

        return new static(
            repository: $validData['repository'],
            branch: $validData['branch'] ?? null,
            tag: $validData['tag'] ?? null,
        );
    }

    /**
     * Pull the workflow from the source and save it to the destination.
     *
     * @throws \App\Services\Snakemake\Workflow\Exceptions\WorkflowPullException
     */
    #[Override]
    public function pull(string $workflowDir, ?Logger $output = null): void
    {
        /** @var SnakemakeCommands $commands */
        $commands = app('snakemake.commands');
        $process = $commands->pullWorkflow(
            repository: $this->repository,
            destination: $workflowDir,
            tag: $this->tag,
            branch: $this->branch,
            output: $output,
        );
        $processResult = $process->wait();
        if ($processResult->failed()) {
            throw new WorkflowPullException("Failed to pull the workflow from the git repository! Error code: {$processResult->exitCode()}");
        }
        if (! File::exists($workflowDir)) {
            throw new WorkflowPullException('Failed to pull the workflow from the git repository! The workflow directory does not exist.');
        }
    }
}
