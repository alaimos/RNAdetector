<?php

namespace App\Services\Metadata\Readers;

use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Metadata\Contracts\Reader;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use Spatie\StructureDiscoverer\Data\DiscoveredClass;
use Spatie\StructureDiscoverer\Discover;

final class Factory
{
    /**
     * The registered sources.
     *
     * @var array<string, class-string<Reader>>
     */
    private array $readers;

    public function __construct()
    {
        $this->registerReaders();
    }

    public function from(string $extension, array $options = []): Reader
    {
        if (! array_key_exists($extension, $this->readers)) {
            throw new InvalidArgumentException("No reader found for the extension $extension.");
        }
        $readerClass = $this->readers[$extension];

        return $readerClass::from($options);
    }

    /**
     * Instantiate a source from an array.
     * The array must contain a 'type' key that matches a registered source.
     *
     * @param  array<string, mixed>  $options
     */
    public function read(string $filename, array $options = []): MetadataContainer
    {
        if (! File::exists($filename)) {
            throw new InvalidArgumentException("The file $filename does not exist.");
        }
        $extension = strtolower(File::extension($filename));
        if (! array_key_exists($extension, $this->readers)) {
            $extension = strtolower(File::guessExtension($filename));
        }

        return $this->from($extension, $options)->read($filename);
    }

    /**
     * Automatically discover and register all sources.
     */
    private function registerReaders(): void
    {
        $this->readers = [];
        $classes = Discover::in(app_path())
            ->classes()
            ->implementing(Reader::class)
            ->custom(function (DiscoveredClass $discoveredData) {
                return ! $discoveredData->isAbstract;
            })
            ->get();
        foreach ($classes as $class) {
            /** @var class-string<Reader> $class */
            $extensions = $class::supportedExtensions();
            foreach ($extensions as $ext) {
                $this->readers[strtolower($ext)] = $class;
            }
        }
    }
}
