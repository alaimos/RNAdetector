<?php

namespace App\Models;

use App\Services\DataFiles\Contracts\DataType as DataTypeContract;
use App\Services\DataFiles\DataTypeRepository;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class DataType extends Model
{
    use HasSlug;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'slug',
        'name',
        'description',
    ];

    /**
     * Get the data belonging to this data type.
     */
    public function data(): HasMany
    {
        return $this->hasMany(Data::class);
    }

    /**
     * Get the descriptor object for this data type.
     */
    public function descriptor(): ?DataTypeContract
    {
        try {
            return app(DataTypeRepository::class)->get($this->slug);
        } catch (NotFoundExceptionInterface|ContainerExceptionInterface) {
            return null;
        }
    }
}
