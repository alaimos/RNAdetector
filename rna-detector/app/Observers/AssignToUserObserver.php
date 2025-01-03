<?php

namespace App\Observers;

use App\Contracts\Models\AssignedToUser;

class AssignToUserObserver
{
    public function creating(AssignedToUser $model): void
    {
        // @phpstan-ignore-next-line
        if (! $model->user_id) {
            /** @noinspection PhpDynamicFieldDeclarationInspection */
            $model->user_id = auth()->id();
        }
    }
}
