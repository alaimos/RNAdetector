<?php

namespace App\Services\Snakemake\Workflow\Data;

use App\Models\Data;
use App\Models\Dataset;
use App\Models\DataType;
use App\Services\Snakemake\Workflow\Contracts\Data\DataPathResolver;
use App\Services\Snakemake\Workflow\Contracts\Data\PulledDataset as Contract;
use Illuminate\Support\Facades\File;

class PulledDataset implements Contract
{
    /**
     * A dataset to use in the workflow.
     */
    public readonly Dataset $dataset;

    /**
     * The data pulled from the dataset.
     *
     * @var \App\Models\Data[]
     */
    public readonly array $data;

    /**
     * An instance of a data path resolver.
     */
    public DataPathResolver $dataPathResolver;

    /**
     * Create a new instance.
     */
    public function __construct(Dataset $dataset, DataPathResolver $dataPathResolver, array $data)
    {
        $this->dataset = $dataset;
        $this->dataPathResolver = $dataPathResolver;
        $this->data = $data;
    }

    /**
     * Create a new instance from a dataset and an optional data type.
     * The dataset should be preloaded with all its data to avoid unnecessary database queries.
     * The data type can be a string (data type slug), an integer (data type ID), a DataType instance, or
     * an array of these values.
     *
     * @param  int|string|DataType|array<int|string|DataType>|null  $dataType
     */
    public static function from(Dataset $dataset, DataPathResolver $dataPathResolver, int|string|DataType|array|null $dataType = null): static
    {
        $dataTypeIds = static::getDataTypeIds($dataType);
        if (! $dataset->relationLoaded('data')) {
            $dataset->load('data');
        }
        $data = $dataset->data->filter(function (Data $data) use ($dataTypeIds) { // @phpstan-ignore-line
            return in_array($data->data_type_id, $dataTypeIds, true);
        });

        return new static($dataset, $dataPathResolver, $data->all()); // @phpstan-ignore-line
    }

    /**
     * Collect and links the data files from the dataset.
     */
    public function collectDataFiles(string $workflowDir): CollectedDataFiles
    {
        $dataFiles = [];
        $resolver = $this->dataPathResolver;
        $types = $resolver->resolvedTypes();
        foreach ($this->data as $data) {
            foreach ($types as $type) {
                if (! $data->hasDataFile($type)) {
                    continue;
                }
                $contentName = $data->content[$type];
                $contentDataFile = $data->dataFile($type);
                if ($contentDataFile === null) {
                    continue;
                }
                $destinationName = $resolver($type, $contentName, $data, $this->dataset);
                if ($destinationName === null) {
                    continue;
                }
                $destinationFile = $workflowDir.'/'.$destinationName;
                File::ensureDirectoryExists(dirname($destinationFile));
                if (! $contentDataFile->link($destinationFile)) {
                    throw new \RuntimeException("Failed to link data file '{$contentDataFile->absolutePath()}' to '{$destinationFile}'");
                }
                if (! isset($dataFiles[$type])) {
                    $dataFiles[$type] = [];
                }
                $dataFiles[$type][$data->name] = $destinationFile;
            }
        }

        return CollectedDataFiles::from($dataFiles);
    }

    /**
     * Get the data type IDs from a data type or an array of data types.
     *
     *
     * @return array|int[]
     */
    protected static function getDataTypeIds(int|string|DataType|array|null $dataType): array
    {
        if (is_int($dataType)) {
            return [$dataType];
        }
        if (is_string($dataType)) {
            $dataType = [$dataType];
        }
        $dataTypeIds = [];
        $dataTypesToFetch = [];
        foreach ($dataType as $type) {
            if (is_int($type)) {
                $dataTypeIds[] = $type;
            } elseif (is_string($type)) {
                $dataTypesToFetch[] = $type;
            } elseif ($type instanceof DataType) {
                $dataTypeIds[] = $type->id;
            }
        }
        if (! empty($dataTypesToFetch)) {
            $dataTypes = DataType::whereIn('slug', $dataTypesToFetch)->pluck('id');
            $dataTypeIds = array_merge($dataTypeIds, $dataTypes->values()->all());
        }

        return $dataTypeIds;
    }
}
