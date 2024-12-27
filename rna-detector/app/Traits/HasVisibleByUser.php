<?php

/** @noinspection UnknownColumnInspection */

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property bool $is_public
 * @property int $user_id
 */
trait HasVisibleByUser
{
    public function scopeVisibleByUser(Builder $query, User $user): void
    {
        if ($user->is_admin) {
            return;
        }
        $query->where(function (Builder $internalQuery) use ($user) {
            $internalQuery->where('is_public', true)
                ->orWhere('user_id', $user->id);
        });
    }

    /**
     * Check if the dataset is visible by the given user.
     */
    public function isVisibleByUser(User $user): bool
    {
        return $this->is_public || $user->is_admin || $this->user_id === $user->id;
    }

    /**
     * Check if the dataset is modifiable by the given user.
     */
    public function isModifiableByUser(User $user): bool
    {
        return $user->is_admin || $this->user_id === $user->id;
    }
}
