<?php

namespace App\Services\Snakemake\Workflow\Data;

use App\Models\Dataset;
use App\Models\DataType;
use App\Services\Snakemake\Workflow\Contracts\Data\DataPathResolver;
use App\Services\Snakemake\Workflow\Contracts\Data\Specifications as SpecificationsContract;
use ArrayAccess;
use Closure;
use Illuminate\Contracts\Config\Repository as ConfigContract;
use Illuminate\Support\Arr;
use Override;

/**
 * A set of specifications for pulling datasets from the workflow configuration.
 */
class Specifications implements SpecificationsContract
{
    /**
     * How to get the list of datasets from the workflow configuration.
     * It can be a string (path inside the config object in laravel style)
     * or a closure that receives the config object and returns the list of datasets.
     *
     * @var string|string[]|(\Closure(ArrayAccess&ConfigContract): string|string[])
     */
    public readonly string|array|Closure $source;

    /**
     * The name of the  data type to pull from the workflow configuration.
     * The data type should be the slug of a type registered in the DataTypeRepository.
     * @var string|int|DataType|array<int|string|DataType>
     */
    public readonly string|array|DataType|int $dataType;

    /**
     * The configuration object to use when collecting data.
     * @var \ArrayAccess&\Illuminate\Contracts\Config\Repository
     */
    public protected(set) ArrayAccess&ConfigContract $config;

    /**
     * The path resolver to use when collecting data.
     */
    public protected(set) DataPathResolver $pathResolver;

    /**
     * Create a new instance.
     * @param  string|string[]|(\Closure(ArrayAccess&ConfigContract): string|string[])  $source
     */
    public function __construct(string|array|Closure $source, string|array|DataType|int $dataType, DataPathResolver $pathResolver)
    {
        $this->source = $source;
        $this->dataType = $dataType;
        $this->pathResolver = $pathResolver;
    }

    /**
     * Get the instance as an array.
     *
     * @return array<int, \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset>
     */
    #[Override]
    public function toArray(): array
    {
        return $this->collect();
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
        if (!isset($data['source'], $data['dataType'], $data['pathResolver'])) {
            throw new \InvalidArgumentException(
                'The data array must contain the keys "source", "dataType", and "pathResolver".'
            );
        }

        return new static( // @phpstan-ignore-line
            source:       $data['source'],
            dataType:     $data['dataType'],
            pathResolver: $data['pathResolver'],
        );
    }

    /**
     * Set the configuration object to use when collecting datasets.
     *
     * @param  ArrayAccess<string, mixed>&ConfigContract  $config
     */
    #[Override]
    public function withConfig(ArrayAccess&ConfigContract $config): Specifications
    {
        $this->config = $config;

        return $this;
    }

    /**
     * Set the path resolver to use when collecting datasets.
     */
    #[Override]
    public function withPathResolver(DataPathResolver $pathResolver): Specifications
    {
        $this->pathResolver = $pathResolver;

        return $this;
    }

    /**
     * @return \App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset[]
     */
    #[Override]
    public function collect(): array
    {
        $sourceDatasets = $this->collectDatasetIds();

        return Dataset::query()
                      ->whereIn('id', $sourceDatasets)
                      ->with('data')
                      ->get()
                      ->map(
                          function (Dataset $dataset): PulledDataset {
                              return PulledDataset::from($dataset, $this->pathResolver, $this->dataType);
                          }
                      )
                      ->toArray();
    }

    /**
     * Collect the dataset identifiers from the source.
     *
     * @return array<int>
     */
    protected function collectDatasetIds(): array
    {
        $source = null;
        if (is_string($this->source)) {
            $source = $this->config->get($this->source);
        } elseif (is_array($this->source)) {
            $source = $this->config->get($this->source);
            if ($source) {
                $source = Arr::flatten($source, depth: 1);
            }
        } elseif ($this->source instanceof Closure) {
            $source = ($this->source)($this->config);
        }
        if (!$source) {
            return [];
        }
        if (!is_array($source)) {
            return [$source];
        }

        return $source;
    }

}
