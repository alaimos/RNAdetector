<?php

namespace App\Services\Snakemake\Workflow\ConfigGenerators;

use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Snakemake\Workflow\Data\CollectedDataFiles;
use App\Services\Snakemake\Workflow\WorkflowDatasets;
use Closure;
use Illuminate\Config\Repository as ConfigRepository;
use InvalidArgumentException;
use Override;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv;

class TsvConfigGenerator extends AbstractConfigGenerator
{

    /**
     * The name of the file generated by this config generator.
     */
    public protected(set) string $file;

    /**
     * A callback to prepare the configuration before it is written to a file.
     * The callback should accept the configuration parameters, data files, datasets, and metadata.
     * It should return an 2-dimensional array where each element is a row in the TSV file.
     * The first row should contain the column headers only when required.
     *
     * @var Closure(ConfigRepository, CollectedDataFiles, WorkflowDatasets, MetadataContainer): (string[][])
     */
    public Closure $prepareConfigCallback;

    /**
     * @param  string  $file
     * @param  Closure(ConfigRepository, CollectedDataFiles, WorkflowDatasets, MetadataContainer): (string[][])  $prepareConfigCallback
     */
    public function __construct(string $file, Closure $prepareConfigCallback)
    {
        $this->file = $file;
        $this->prepareConfigCallback = $prepareConfigCallback;
    }

    /**
     * Convert an array to a Config Generator instance.
     *
     * @param  array<string, mixed>  $data
     */
    #[Override]
    public static function from(array $data): static
    {
        if (!isset($data['file'], $data['prepareConfigCallback'])) {
            throw new InvalidArgumentException('The data array must contain the file and prepareConfigCallback keys.');
        }

        return new static( // @phpstan-ignore-line
            file:                  $data['file'],
            prepareConfigCallback: $data['prepareConfigCallback']
        );
    }

    /**
     * Get the name of the file generated by this config generator.
     * The name should also include the path relative to the workflow directory.
     */
    #[Override]
    public function file(): string
    {
        return $this->file;
    }

    /**
     * Write the configuration to a file in the given directory.
     */
    #[Override]
    public function write(string $workflowDir): void
    {
        $config = ($this->prepareConfigCallback)(
            $this->params,
            $this->dataFiles,
            $this->datasets,
            $this->metadata,
        );

        $spreadsheet = new Spreadsheet();
        $activeSheet = $spreadsheet->getActiveSheet();
        $activeSheet->fromArray($config);
        $writer = new Csv($spreadsheet);
        $writer->setDelimiter("\t");
        $writer->setEnclosure();
        $writer->setLineEnding(PHP_EOL);
        $writer->setSheetIndex($spreadsheet->getActiveSheetIndex());
        $writer->setEnclosureRequired(false);
        $configPath = $workflowDir.'/'.$this->file;
        $writer->save($configPath);
    }

    /**
     * Get the name of the config generator.
     */
    #[Override]
    public static function name(): string
    {
        return 'tsv';
    }
}
