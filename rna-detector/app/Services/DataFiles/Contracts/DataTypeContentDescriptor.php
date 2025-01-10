<?php

namespace App\Services\DataFiles\Contracts;

use App\Models\Data;

interface DataTypeContentDescriptor
{
    /**
     * A user-friendly name for this content (i.e., Forward FASTQ file, GTF file, etc.).
     */
    public string $name {
        get;
    }

    /**
     * An optional description of the content.
     */
    public ?string $description {
        get;
    }

    /**
     * An array listing supported file extensions and MIME types for this content.
     * Each key is a MIME type, and the value is an array of file extensions that are valid for that MIME type.
     * The extensions should be lowercase and include the leading period (e.g., ".fastq", ".fq").
     *
     * @var array<string, string[]>
     */
    public array $extensions {
        get;
    }

    /**
     * Creates a new descriptor object from an array of data.
     * The array will contain the keys "name", "description", "extensions", and any other keys needed for the content descriptor.
     */
    public static function from(array $data): static;

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
    public function processUploadedFile(Data $data, string $uploadedFile, string $dataPath, mixed $job): ?array;
}
