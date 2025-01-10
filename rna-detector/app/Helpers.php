<?php

namespace App;

class Helpers
{
    /**
     * Get the path to a dataset directory.
     *
     * @param  int  $datasetId  The ID of the dataset.
     */
    public static function getDatasetPath(int $datasetId): string
    {
        return config('rnadetector.user_data_path').'/datasets/'.$datasetId;
    }

    /**
     * Get the path to a data directory.
     *
     * @param  int  $dataId  The ID of the data.
     * @param  int  $datasetId  The ID of the dataset which contains the data.
     */
    public static function getDataPath(int $dataId, int $datasetId): string
    {
        return self::getDatasetPath($datasetId).'/data/'.$dataId;
    }
}
