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
    /**
     * Scope a query to only include datasets visible by the given user.
     * If no user is provided, the authenticated user will be used.
     */
    public function scopeVisibleByUser(Builder $query, ?User $user = null): void
    {
        $user ??= auth()->user();
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
     * If no user is provided, the authenticated user will be used.
     */
    public function isVisibleByUser(?User $user = null): bool
    {
        $user ??= auth()->user();

        return $this->is_public || $user->is_admin || $this->user_id === $user->id;
    }

    /**
     * Check if the dataset is modifiable by the given user.
     * If no user is provided, the authenticated user will be used.
     */
    public function isModifiableByUser(?User $user = null): bool
    {
        $user ??= auth()->user();

        return $user->is_admin || $this->user_id === $user->id;
    }
}
