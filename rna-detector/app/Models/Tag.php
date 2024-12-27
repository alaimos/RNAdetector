<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * The datasets that belong to the tag.
     */
    public function datasets(): BelongsToMany
    {
        return $this->belongsToMany(Dataset::class);
    }

    /**
     * The data that belong to the tag.
     */
    public function data(): BelongsToMany
    {
        return $this->belongsToMany(Data::class);
    }
}
