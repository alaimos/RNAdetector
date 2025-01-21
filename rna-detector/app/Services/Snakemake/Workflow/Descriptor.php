<?php

namespace App\Services\Snakemake\Workflow;

use App\Services\Snakemake\Workflow\Contracts\ConfigGenerator as ConfigGeneratorContract;
use App\Services\Snakemake\Workflow\Contracts\Data\Descriptor as DataDescriptorContract;
use App\Services\Snakemake\Workflow\Contracts\Source;
use App\Services\Snakemake\Workflow\Data\Descriptor as DataDescriptor;
use Closure;

class Descriptor
{
    public protected(set) Source $source;

    /**
     * @var DataDescriptorContract[]
     */
    public protected(set) array $dataDescriptors;

    /**
     * @var ConfigGeneratorContract[]
     */
    public protected(set) array $configGenerators;

    /**
     * @var (\Closure(string, Closure): void)|null
     */
    public protected(set) ?Closure $patcher = null;

    /**
     * Initialize the descriptor.
     *
     * @param  array{source: Source|array<string, mixed>, dataDescriptors: (DataDescriptorContract|array<string, mixed>)[], configGenerators: (ConfigGeneratorContract|array<string, mixed>)[], patcher?: (\Closure(string, Closure): void)|null}  $params
     */
    public function __construct(array $params)
    {
        $this->initSource($params['source']);
        $this->initDataDescriptors($params['dataDescriptors']);
        $this->initConfigGenerators($params['configGenerators']);
        $this->patcher = $params['patcher'] ?? null;
    }

    /**
     * Create a new descriptor from an array that contains the source, data descriptors, and configuration generators.
     *
     * @param  array{source: Source|array<string, mixed>, dataDescriptors: (DataDescriptorContract|array<string, mixed>)[], configGenerators: (ConfigGeneratorContract|array<string, mixed>)[], patcher?: (\Closure(string, Closure): void)|null}  $params
     */
    public static function from(array $params): static
    {
        return new static($params); // @phpstan-ignore-line
    }

    /**
     * Initialize the source.
     *
     * @param  Source|array<string, mixed>  $source
     */
    protected function initSource(Source|array $source): void
    {
        if (is_array($source)) {
            $source = Facade\Source::from($source);
        }
        $this->source = $source;
    }

    /**
     * Initialize the data descriptors.
     *
     * @param  (DataDescriptorContract|array<string, mixed>)[]  $dataDescriptors
     */
    protected function initDataDescriptors(array $dataDescriptors): void
    {
        $this->dataDescriptors = [];
        foreach ($dataDescriptors as $dataDescriptor) {
            if (is_array($dataDescriptor)) {
                $dataDescriptor = DataDescriptor::from($dataDescriptor);
            }
            $this->dataDescriptors[] = $dataDescriptor;
        }
    }

    /**
     * Initialize the configuration generators.
     *
     * @param  (ConfigGeneratorContract|array<string, mixed>)[]  $configGenerators
     */
    protected function initConfigGenerators(array $configGenerators): void
    {
        $this->configGenerators = [];
        foreach ($configGenerators as $configGenerator) {
            if (is_array($configGenerator)) {
                $configGenerator = Facade\ConfigGenerator::from($configGenerator);
            }
            $this->configGenerators[] = $configGenerator;
        }
    }
}
