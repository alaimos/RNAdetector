<?php

namespace App\Services\Metadata\Writers;

use Override;
use PhpOffice\PhpSpreadsheet\Spreadsheet as ParsedSpreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\IWriter;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxSpreadsheetWriter;

class Xlsx extends Spreadsheet
{
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
    #[Override]
    protected function createWriter(ParsedSpreadsheet $spreadsheet): IWriter
    {
        return new XlsxSpreadsheetWriter($spreadsheet);
    }
}
