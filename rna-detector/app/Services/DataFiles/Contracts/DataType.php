<?php

namespace App\Services\DataFiles\Contracts;

interface DataType
{
    /**
     * A unique identifier for this data type.
     */
    public string $slug {
        get;
    }

    /**
     *  A user-friendly name for this data type (i.e., FASTQ, GTF, etc.).
     */
    public string $name {
        get;
    }

    /**
     * An optional description of the data type.
     */
    public ?string $description {
        get;
    }

    /**
     * An array of content descriptors for this data type.
     * The keys are the slugs of the content types, and the values are the content descriptors.
     * Keys are also used as the keys in the content array of the data object.
     *
     * @var array<string, \App\Services\DataFiles\Contracts\DataTypeContentDescriptor>
     */
    public array $content {
        get;
    }

    /**
     * Creates a new data type object from an array of data.
     * The array will contain the keys "slug", "name", "description", and "content".
     * The "content" key will contain an array of content descriptors.
     */
    public static function from(array $data): static;

    /**
     * Returns an array of keys that are used to identify the content descriptors.
     */
    public function contentKeys(): array;
}
