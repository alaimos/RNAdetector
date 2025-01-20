<?php

namespace App\Services\Metadata\Writers;

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
}
