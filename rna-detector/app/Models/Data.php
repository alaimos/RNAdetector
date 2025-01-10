<?php

namespace App\Models;

use App\Contracts\Models\AssignedToUser;
use App\Enums\JobStatus;
use App\Helpers;
use App\Observers\AssignToUserObserver;
use App\Services\DataFiles\Contracts\DataTypeContentDescriptor;
use App\Services\DataFiles\DataFile;
use App\Traits\HasVisibleByUser;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\File;

/**
 * @property \ArrayObject|null $content
 */
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

    /**
     * Get the path to the data folder.
     */
    public function path(): string
    {
        $path = Helpers::getDataPath($this->id, $this->dataset_id);
        File::ensureDirectoryExists(storage_path($path));

        return $path;
    }

    /**
     * Get the content descriptor for the given content element.
     */
    public function contentDescriptor(string $element): ?DataTypeContentDescriptor
    {
        if (! $this->relationLoaded('dataType')) {
            return null;
        }
        $typeDescriptor = $this->dataType->descriptor(); // @phpstan-ignore-line

        return $typeDescriptor->content[$element] ?? null;
    }

    /**
     * Get the data file object for the given content element.
     */
    public function dataFile(string $element): ?DataFile
    {
        if (! isset($this->content[$element])) {
            return null;
        }
        $filePath = $this->path().'/'.$this->content[$element];

        return new DataFile($filePath);
    }
}
