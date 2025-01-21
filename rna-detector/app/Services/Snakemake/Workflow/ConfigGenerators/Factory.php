<?php

namespace App\Services\Snakemake\Workflow\ConfigGenerators;

use App\Services\Snakemake\Workflow\Contracts\ConfigGenerator;
use InvalidArgumentException;
use Spatie\StructureDiscoverer\Data\DiscoveredClass;
use Spatie\StructureDiscoverer\Discover;

final class Factory
{
    /**
     * The registered config generators.
     *
     * @var array<string, class-string<ConfigGenerator>>
     */
    private array $generators;

    public function __construct()
    {
        $this->registerGenerators();
    }

    /**
     * Instantiate a generator from an array.
     * The array must contain a 'name' key that matches a registered generator.
     *
     * @param  array<string, mixed>  $data
     */
    public function from(array $data): ConfigGenerator
    {
        if (! isset($data['name'], $this->generators[$data['name']])) {
            throw new InvalidArgumentException('Invalid generator name');
        }
        $generatorClass = $this->generators[$data['name']];

        return $generatorClass::from($data);
    }

    /**
     * Automatically discover and register all sources.
     */
    private function registerGenerators(): void
    {
        $this->generators = [];
        $classes = Discover::in(app_path())
            ->classes()
            ->implementing(ConfigGenerator::class)
            ->custom(function (DiscoveredClass $class) {
                return ! $class->isAbstract;
            })
            ->get();
        foreach ($classes as $class) {
            /** @var class-string<ConfigGenerator> $class */
            $type = $class::name();
            $this->generators[$type] = $class;
        }
    }
}
