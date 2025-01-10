<?php

return [

    'mamba_bin_path' => env('MAMBA_BIN_PATH', '/rnadetector/miniforge/bin/mamba'),
    'snakemake_env' => env('SNAKEMAKE_ENV', 'snakemake'),
    'local_workflow_repository_path' => env('LOCAL_WORKFLOW_REPOSITORY_PATH', 'app/private/workflows'),
    'user_analysis_path' => env('USER_ANALYSIS_PATH', 'app/public/analysis'),
    'user_data_path' => env('USER_DATA_PATH', 'app/public/data'),

    'default_temporary_url_expiration' => env('DEFAULT_TEMPORARY_EXPIRATION_MINUTES', 30),

];
