<?php

namespace App\Models;

use App\Contracts\Models\AssignedToUser;
use App\Enums\JobStatus;
use App\Observers\AssignToUserObserver;
use App\Traits\HasVisibleByUser;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy(AssignToUserObserver::class)]
class Data extends Model implements AssignedToUser
{
    use HasVisibleByUser;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'data_type_id',
        'is_public',
        'queue_id',
        'status',
        'dataset_id',
        'content',
        'user_id',
    ];

    /**
     * Get the user that owns the data.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the dataset that owns the data.
     */
    public function dataset(): BelongsTo
    {
        return $this->belongsTo(Dataset::class);
    }

    /**
     * Get the data type of the data.
     */
    public function dataType(): BelongsTo
    {
        return $this->belongsTo(DataType::class);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'status' => JobStatus::class,
            'content' => AsArrayObject::class,
        ];
    }
}
