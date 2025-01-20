<?php

namespace App\Services\Metadata\Writers;

use Override;
use PhpOffice\PhpSpreadsheet\Spreadsheet as ParsedSpreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv as CsvSpreadsheetWriter;
use PhpOffice\PhpSpreadsheet\Writer\IWriter;

class Csv extends Spreadsheet
{
    /**
     * The character that delimits fields.
     */
    protected string $delimiter = ',';

    /**
     * The character that encloses fields.
     */
    protected string $enclosure = '"';

    /**
     * Create a new CSV reader instance.
     *
     * @param  array<string, mixed>  $params
     */
    public function __construct(array $params = [])
    {
        parent::__construct($params);
        $this->delimiter = $params['delimiter'] ?? ',';
        $this->enclosure = $params['enclosure'] ?? '"';
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public static function from(array $params): static
    {
        return new static($params); // @phpstan-ignore-line
    }

    /**
     * Create a new instance of a spreadsheet writer configured with the appropriate options.
     */
    #[\Override]
    protected function createWriter(ParsedSpreadsheet $spreadsheet): IWriter
    {
        return new CsvSpreadsheetWriter($spreadsheet)
            ->setDelimiter($this->delimiter)
            ->setEnclosure($this->enclosure)
            ->setUseBOM(true);
    }
}
