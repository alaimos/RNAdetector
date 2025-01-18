<?php

namespace App\Services\Metadata\Readers;

use Override;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxSpreadsheetReader;
use PhpOffice\PhpSpreadsheet\Reader\IReader;

class Xlsx extends Spreadsheet
{

    /**
     * The name of the selected Excel sheet.
     * If null, the first sheet will be selected.
     */
    private ?string $selectedSheet;

    /**
     * Create a new XLSX reader instance.
     *
     * @param  array<string, mixed>  $params
     */
    public function __construct(array $params = [])
    {
        parent::__construct($params);
        $this->selectedSheet = $params['selectedSheet'] ?? null;
    }

    /**
     * {@inheritDoc}
     */
    #[Override]
    public static function supportedExtensions(): array
    {
        return ['xlsx'];
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
        $reader = new XlsxSpreadsheetReader()->setReadDataOnly(true);
        if ($this->selectedSheet) {
            $reader->setLoadSheetsOnly($this->selectedSheet);
        }
        return $reader;
    }
}
