<?php

namespace App\Models;

use App\Contracts\Models\AssignedToUser;
use App\Helpers;
use App\Observers\AssignToUserObserver;
use App\Traits\HasVisibleByUser;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\File;

#[ObservedBy(AssignToUserObserver::class)]
class Dataset extends Model implements AssignedToUser
{
    use HasVisibleByUser;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_public',
        'metadata_file',
        'user_id',
    ];

    /**
     * Get the user that owns the dataset.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the data contained in the dataset.
     */
    public function data(): HasMany
    {
        return $this->hasMany(Data::class);
    }

    /**
     * Get the visible data contained in the dataset.
     */
    public function visibleData(): HasMany
    {
        return $this->data()->visibleByUser(); // @phpstan-ignore-line
    }

    /**
     * The tags of this dataset.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    /**
     * Get the path to the dataset folder.
     */
    public function path(): string
    {
        $path = Helpers::getDatasetPath($this->id);
        File::ensureDirectoryExists(storage_path($path));

        return $path;
    }
}
