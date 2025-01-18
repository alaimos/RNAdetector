<?php

namespace App\Services\Metadata\Readers;

use App\Services\Metadata\Container;
use App\Services\Metadata\Container as MetadataContainer;
use App\Services\Metadata\Contracts\Reader;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Reader\IReader;
use PhpOffice\PhpSpreadsheet\Spreadsheet as ParsedSpreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\RowCellIterator;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

abstract class Spreadsheet implements Reader
{
    /**
     * Whether to ignore comments in the file.
     */
    protected bool $skipComments = true;

    /**
     * The character that indicates a comment.
     */
    protected string $commentPrefix = '#';

    /**
     * Whether the file has a header row.
     * If true, the first row will be used as the header.
     * If false, columns will be named col_1, col_2, etc.
     * The first column will always be named sample_id.
     */
    protected bool $hasHeader = true;

    /**
     * The number of rows to skip before reading data.
     */
    protected int $skipRows = 0;

    /**
     * The number of columns to skip before reading data.
     */
    protected int $skipColumns = 0;

    /**
     * Whether to skip empty rows.
     */
    protected bool $skipEmptyRows = true;

    /**
     * The map of column index to column name.
     */
    protected array $indexToNameMap = [];

    /**
     * The data read from the file.
     */
    protected array $data = [];

    /**
     * @param  array<string, mixed>  $params
     */
    public function __construct(array $params = [])
    {
        $this->skipRows = $params['skipRows'] ?? 0;
        $this->skipColumns = $params['skipColumns'] ?? 0;
        $this->skipEmptyRows = $params['skipEmptyRows'] ?? true;
        $this->skipComments = $params['skipComments'] ?? true;
        $this->commentPrefix = $params['commentPrefix'] ?? '#';
        $this->hasHeader = $params['hasHeader'] ?? true;
    }

    /**
     * {@inheritDoc}
     */
    public function read(string $file): MetadataContainer
    {
        if (! File::exists($file)) {
            throw new InvalidArgumentException("File not found: $file");
        }
        $reader = $this->createReader();
        $spreadsheet = $reader->load($file);
        $sheet = $this->getActiveSheet($spreadsheet);
        $this->readSheet($sheet);

        return Container::from($this->data);
    }

    /**
     * Create a new instance of a spreadsheet reader configured with the appropriate options.
     */
    abstract protected function createReader(): IReader;

    /**
     * Get the active sheet from the spreadsheet, which is the sheet that will be read and processed.
     * This method can be overridden in subclasses to read a specific sheet.
     * By default, the active sheet is the first sheet in the spreadsheet.
     *
     * @param  ParsedSpreadsheet  $spreadsheet  The spreadsheet object.
     *
     * @return Worksheet The active sheet.
     */
    protected function getActiveSheet(ParsedSpreadsheet $spreadsheet): Worksheet
    {
        return $spreadsheet->getActiveSheet();
    }

    /**
     * Read the data from a sheet in the spreadsheet.
     * The data is stored in the data property.
     * The data is stored as an associative array with column names as keys and arrays of values as values.
     * The values are indexed by sample ID.
     * The first column is always the sample ID column.
     * The column names are stored in the indexToNameMap property.
     * The first row is used as the header if the hasHeader option is true.
     * If the hasHeader option is false, the columns are named col_1, col_2, etc.
     * The skipRows and skipColumns options are used to skip rows and columns before reading data.
     * The skipEmptyRows option is used to skip empty rows.
     * The skipComments option is used to skip rows that start with the comment prefix.
     * The comment prefix is # by default.
     * The comment prefix can be changed by setting the commentPrefix property.
     * The comment prefix is only used if the skipComments option is true.
     */
    protected function readSheet(Worksheet $sheet): void
    {
        $this->data = [];
        $rowIterator = $sheet->getRowIterator();
        $firstColumn = Coordinate::stringFromColumnIndex($this->skipColumns + 1);
        $currentRow = 0;
        $isFirstRow = true;
        foreach ($rowIterator as $row) {
            if ($this->skipEmptyRows && $row->isEmpty(startColumn: $firstColumn)) {
                continue;
            }
            $firstValue = $sheet->getCell([$this->skipColumns + 1, $row->getRowIndex()])->getValue();
            if ($this->skipComments && str_starts_with($firstValue, $this->commentPrefix)) {
                continue;
            }
            if ($currentRow++ < $this->skipRows) {
                continue;
            }
            $columnIterator = $row->getCellIterator(startColumn: $firstColumn);
            if ($isFirstRow) {
                $isFirstRow = false;
                $this->initializeColumnNames($columnIterator);
                if ($this->hasHeader) {
                    continue;
                }
            }
            $this->readRow($columnIterator);
        }
    }

    /**
     * Initialize the column names from the first row of the sheet.
     * The first column is always named 'sample_id'.
     * If the hasHeader option is true, the column names will be taken from the first row.
     * If the hasHeader option is false, the column names will be col_1, col_2, etc.
     * The column names are stored in the indexToNameMap property.
     * The data property is initialized with empty arrays for each column.
     */
    protected function initializeColumnNames(RowCellIterator $columnIterator): void
    {
        $this->indexToNameMap = [];
        $currentColumn = 0;
        foreach ($columnIterator as $cell) {
            $columnIndex = $cell->getColumn();
            if ($currentColumn === 0) {
                $columnName = self::SAMPLE_ID_COLUMN;
            } else {
                $columnName = $this->hasHeader ? $cell->getValue() : 'col_'.$currentColumn;
            }
            $this->indexToNameMap[$columnIndex] = $columnName;
            $this->data[$columnName] = [];
            $currentColumn++;
        }
    }

    /**
     * Read a row from the sheet.
     */
    protected function readRow(RowCellIterator $columnIterator): void
    {
        $isFirstColumn = true;
        $sampleId = null;
        foreach ($columnIterator as $cell) {
            $columnIndex = $cell->getColumn();
            $columnName = $this->indexToNameMap[$columnIndex];
            if ($columnName === self::SAMPLE_ID_COLUMN && $isFirstColumn) {
                $sampleId = $cell->getValue();
                $isFirstColumn = false;
            }
            if (! $sampleId) {
                break;
            }
            $this->data[$columnName][$sampleId] = $cell->getValue();
        }
    }
}
