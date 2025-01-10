<?php

namespace App\Services\DataFiles;

use App\Models\Data;
use Closure;
use InvalidArgumentException;
use Override;

class GenericContentDescriptor implements Contracts\DataTypeContentDescriptor
{
    /**
     * A user-friendly name for this content (i.e., Forward FASTQ file, GTF file, etc.).
     */
    public string $name;

    /**
     * An optional description of the content.
     */
    public ?string $description;

    /**
     * An array listing supported file extensions and MIME types for this content.
     * Each key is a MIME type, and the value is an array of file extensions that are valid for that MIME type.
     * The extensions should be lowercase and include the leading period (e.g., ".fastq", ".fq").
     *
     * @var array<string, string[]>
     */
    public array $extensions;

    /**
     * A function that processes a content file after it is uploaded.
     *
     * @var (\Closure(Data, string, string, mixed): ?array)|null
     */
    public ?Closure $processUploadedFileCallback = null;

    /**
     * @param  array<string, string[]>  $extensions
     * @param  (\Closure(Data, string, string, mixed): ?array)|null  $processUploadedFileCallback
     */
    public function __construct(
        string $name,
        ?string $description,
        array $extensions,
        ?Closure $processUploadedFileCallback
    ) {
        $this->name = $name;
        $this->description = $description;
        $this->extensions = $extensions;
        $this->processUploadedFileCallback = $processUploadedFileCallback;
    }

    /**
     * Creates a new descriptor object from an array of data.
     * The array will contain the keys "name", "description", "extensions", and any other keys needed for the content descriptor.
     *
     * @param  array{name: string, description?: ?string, extensions: array<string, string[]>, processUploadedFileCallback?: (\Closure(Data, string, string, mixed): ?array)|null}  $data
     */
    #[Override]
    public static function from(array $data): static
    {
        if (! isset($data['name'], $data['extensions'])) { // @phpstan-ignore-line
            throw new InvalidArgumentException('The content descriptor data is missing required fields.');
        }
        $callback = $data['processUploadedFileCallback'] ?? null;
        if (! $callback instanceof Closure) {
            $callback = null;
        }

        return new static(  // @phpstan-ignore-line
            name: $data['name'],
            description: $data['description'] ?? null,
            extensions: $data['extensions'],
            processUploadedFileCallback: $callback
        );
    }

    /**
     * A function that processes a content file after it is uploaded.
     * The function will be run in a separate worker process, so it should not rely on any external state.
     * The function will receive four arguments: the data object, the path to the uploaded file,
     * the path of the data folder, and the job object from the queue.
     * The function should return an optional object containing changes to the content record
     * contained in the data object.
     * If no changes are made, the function should return null.
     * The function can also throw an error if there is a problem with the post-processing.
     * The function should not modify the data object directly, as it will not be saved.
     * The function should not modify the data on the database to avoid inconsistencies.
     *
     * @throws \App\Services\DataFiles\DataFileProcessingException
     */
    #[Override]
    public function processUploadedFile(
        Data $data,
        string $uploadedFile,
        string $dataPath,
        mixed $job
    ): ?array {
        if (! $this->processUploadedFileCallback) {
            return null;
        }

        return ($this->processUploadedFileCallback)($data, $uploadedFile, $dataPath, $job);
    }
}
