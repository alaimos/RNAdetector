<?php

namespace App\Enums;

use App\Traits\HasValuesArray;

enum NotificationType: string
{
    use HasValuesArray;

    case INFO = 'info';
    case ERROR = 'error';
    case WARNING = 'warning';
}
