<?php

namespace App\Enums;

use App\Traits\HasValuesArray;

enum JobStatus: string
{
    use HasValuesArray;

    case PENDING = 'pending';
    case WAITING = 'waiting';
    case RUNNING = 'running';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
}
