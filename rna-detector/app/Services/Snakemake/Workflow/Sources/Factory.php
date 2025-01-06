<?php

namespace App\Services\Snakemake\Workflow\Sources;

use App\Services\Snakemake\Workflow\Contracts\Source;
use InvalidArgumentException;
use Spatie\StructureDiscoverer\Discover;

final class Factory
{
    /**
     * The registered sources.
     *
     * @var array<string, class-string<Source>>
     */
    private array $sources;

    public function __construct()
    {
        $this->registerSources();
    }

    /**
     * Instantiate a source from an array.
     * The array must contain a 'type' key that matches a registered source.
     *
     * @param  array<string, mixed>  $data
     */
    public function from(array $data): Source
    {
        if (! isset($data['type'], $this->sources[$data['type']])) {
            throw new InvalidArgumentException('Invalid source type');
        }
        $source = $this->sources[$data['type']];

        return $source::from($data);
    }

    /**
     * Automatically discover and register all sources.
     */
    private function registerSources(): void
    {
        $this->sources = [];
        $classes = Discover::in(app_path())
            ->classes()
            ->implementing(Source::class)
            ->get();
        foreach ($classes as $class) {
            /** @var class-string $class */
            $type = $class::type();
            $this->sources[$type] = $class;
        }
    }
}
