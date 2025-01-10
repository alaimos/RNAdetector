<?php

namespace App\Services\DataFiles;

use App\Models\Data;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Override;

class GenericDataType implements Contracts\DataType
{
    /**
     * A unique identifier for this data type.
     */
    public string $slug;

    /**
     *  A user-friendly name for this data type (i.e., FASTQ, GTF, etc.).
     */
    public string $name;

    /**
     * An optional description of the data type.
     */
    public ?string $description;

    /**
     * An array of content descriptors for this data type.
     * The keys are the slugs of the content types, and the values are the content descriptors.
     * Keys are also used as the keys in the content array of the data object.
     *
     * @var array<string, \App\Services\DataFiles\Contracts\DataTypeContentDescriptor>
     */
    public array $content;

    /**
     * @param  array<string, \App\Services\DataFiles\Contracts\DataTypeContentDescriptor>  $content
     */
    public function __construct(string $slug, string $name, ?string $description, array $content)
    {
        $this->slug = $slug;
        $this->name = $name;
        $this->description = $description;
        $this->content = $content;
    }

    /**
     * Creates a new data type object from an array of data.
     * The array will contain the keys "slug", "name", "description", and "content".
     * The "content" key will contain an array of content descriptors.
     *
     * @param  array{slug?: string, name: string, description?: ?string, content: array<string, \App\Services\DataFiles\Contracts\DataTypeContentDescriptor|(array{name: string, description?: ?string, extensions: array<string, string[]>, processUploadedFileCallback?: (\Closure(Data, string, string, mixed): ?array)|null})>}  $data
     */
    #[Override]
    public static function from(array $data): static
    {
        if (! isset($data['name'], $data['content'])) { // @phpstan-ignore-line
            throw new InvalidArgumentException('The data array must contain the keys "name", and "content".');
        }
        $data['content'] = self::validateContentArray($data['content']);

        if (! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name'], '_');
        }

        return new static( // @phpstan-ignore-line
            slug: $data['slug'],
            name: $data['name'],
            description: $data['description'] ?? null,
            content: $data['content']
        );
    }

    /**
     * Returns an array of keys that are used to identify the content descriptors.
     */
    #[Override]
    public function contentKeys(): array
    {
        return array_keys($this->content);
    }

    /**
     * Validates the content array and converts any arrays to DataTypeContentDescriptor objects.
     *
     * @return array<string, \App\Services\DataFiles\Contracts\DataTypeContentDescriptor>
     */
    private static function validateContentArray(mixed $content): array
    {
        if (! is_array($content)) {
            throw new InvalidArgumentException('The "content" key must be an array.');
        }
        foreach ($content as $key => $value) {
            if (! is_string($key)) {
                throw new InvalidArgumentException('The content array must have string keys.');
            }
            if (! $value instanceof Contracts\DataTypeContentDescriptor && ! is_array($value)) {
                throw new InvalidArgumentException('The content array must contain only DataTypeContentDescriptor objects or arrays.');
            }
            if (is_array($value)) {
                $content[$key] = GenericContentDescriptor::from($value);
            }
        }

        return $content;
    }
}
