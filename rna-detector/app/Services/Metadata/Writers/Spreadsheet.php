<?php

namespace App\Services\Metadata\Writers;

use App\Services\Metadata\Container;
use App\Services\Metadata\Contracts\Writer;
use Illuminate\Support\Facades\File;
use Override;
use PhpOffice\PhpSpreadsheet\Spreadsheet as ParsedSpreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\IWriter;
use RuntimeException;

abstract class Spreadsheet implements Writer
{
    /**
     * Whether to write the variable names to the file.
     */
    protected bool $writeVariableNames;

    /**
     * Whether to write the sample names to the file.
     */
    protected bool $writeSampleNames;

    /**
     * @param  array<string, mixed>  $params
     */
    public function __construct(array $params = [])
    {
        $this->writeVariableNames = $params['writeVariableNames'] ?? true;
        $this->writeSampleNames = $params['writeSampleNames'] ?? false;
    }

    /**
     * Write metadata to a file.
     */
    #[Override]
    public function write(string $file, Container $container): void
    {
        $writer = $this->createWriter($this->convertMetadataToSpreadsheet($container));
        $writer->save($file);
        if (! File::exists($file)) {
            throw new RuntimeException('The file could not be written.');
        }
    }

    /**
     * Create a new instance of a spreadsheet writer configured with the appropriate options.
     */
    abstract protected function createWriter(ParsedSpreadsheet $spreadsheet): IWriter;

    /**
     * Convert the metadata to a spreadsheet.
     */
    protected function convertMetadataToSpreadsheet(Container $container): ParsedSpreadsheet
    {
        $spreadsheet = new ParsedSpreadsheet;
        $worksheet = $spreadsheet->getActiveSheet();
        $this->writeVariableNamesToWorksheet($container, $worksheet);
        $this->writeMetadataToWorksheet($container, $worksheet);

        return $spreadsheet;
    }

    /**
     * Write the variable names to the worksheet if the option is enabled.
     */
    protected function writeVariableNamesToWorksheet(Container $container, Worksheet $worksheet): void
    {
        if (! $this->writeVariableNames) {
            return;
        }
        $variableNames = $container->getVariableNames();
        if ($this->writeSampleNames) {
            array_unshift($variableNames, '');
        }
        $worksheet->fromArray($variableNames);
    }

    /**
     * Write the metadata to the worksheet.
     */
    protected function writeMetadataToWorksheet(Container $container, Worksheet $worksheet): void
    {
        $startCell = $this->writeVariableNames ? 2 : 1;
        $sampleNames = $container->getSampleNames();
        $variableNames = $container->getVariableNames();
        foreach ($sampleNames as $sample) {
            $values = [];
            if ($this->writeSampleNames) {
                $values[] = $sample;
            }
            foreach ($variableNames as $variable) {
                $values[] = $container->get($variable, $sample);
            }
            $worksheet->fromArray($values, null, 'A'.$startCell);
            $startCell++;
        }
    }
}
