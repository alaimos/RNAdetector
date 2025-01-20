<?php

namespace App\Services\Metadata\Writers;

use Override;

class Tsv extends Csv
{
    /**
     * Create a new TSV reader instance.
     *
     * @param  array<string, mixed>  $params
     */
    public function __construct(array $params = [])
    {
        parent::__construct($params);
        $this->delimiter = "\t";
    }

    /**
     * Get the supported extensions for the writer.
     */
    #[Override]
    public static function supportedExtensions(): array
    {
        return ['tsv'];
    }
}
