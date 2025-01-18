<?php

namespace App\Services\Metadata\Readers;

use Override;
use PhpOffice\PhpSpreadsheet\Reader\Csv as CsvSpreadsheetReader;
use PhpOffice\PhpSpreadsheet\Reader\IReader;

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
    public static function supportedExtensions(): array
    {
        return ['csv'];
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
     * {@inheritDoc}
     */
    #[Override]
    protected function createReader(): IReader
    {
        return new CsvSpreadsheetReader()
            ->setDelimiter($this->delimiter)
            ->setEnclosure($this->enclosure);
    }
}
