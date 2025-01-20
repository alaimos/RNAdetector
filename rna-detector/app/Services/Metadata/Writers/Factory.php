<?php

namespace App\Services\Metadata\Writers;

use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Metadata\Contracts\Writer;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use Spatie\StructureDiscoverer\Data\DiscoveredClass;
use Spatie\StructureDiscoverer\Discover;

final class Factory
{
    /**
     * The registered writers.
     *
     * @var array<string, class-string<Writer>>
     */
    private array $writers;

    public function __construct()
    {
        $this->registerWriters();
    }

    /**
     * Get a writer instance for the given extension.
     */
    public function from(string $extension, array $options = []): Writer
    {
        if (! array_key_exists($extension, $this->writers)) {
            throw new InvalidArgumentException("No reader found for the extension $extension.");
        }
        $writerClass = $this->writers[$extension];

        return $writerClass::from($options);
    }

    /**
     * Write metadata to a file.
     */
    public function write(string $filename, MetadataContainer $container, array $options = []): void
    {
        $extension = strtolower(File::extension($filename));
        $this->from($extension, $options)->write($filename, $container);
    }

    /**
     * Automatically discover and register all writers.
     */
    private function registerWriters(): void
    {
        $this->writers = [];
        $classes = Discover::in(app_path())
            ->classes()
            ->implementing(Writer::class)
            ->custom(function (DiscoveredClass $discoveredData) {
                return ! $discoveredData->isAbstract;
            })
            ->get();
        foreach ($classes as $class) {
            /** @var class-string<Writer> $class */
            $extensions = $class::supportedExtensions();
            foreach ($extensions as $ext) {
                $this->writers[strtolower($ext)] = $class;
            }
        }
    }
}
