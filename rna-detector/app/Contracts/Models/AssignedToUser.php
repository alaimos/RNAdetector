<?php

namespace App\Contracts\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $user_id
 * @property \App\Models\User $user
 */
interface AssignedToUser
{
    public function user(): BelongsTo;
}
