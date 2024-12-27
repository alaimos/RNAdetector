<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * @phpstan-method static creating(\Closure $param)
 * @phpstan-method static updating(\Closure $param)
 */
trait HasSlug
{
    /**
     * The column name of the slug.
     */
    protected string $slugColumn = 'slug';

    /**
     * The column name of the origin of the slug.
     */
    protected string $slugOriginColumn = 'name';

    /**
     * The separator of the slug.
     */
    protected string $slugSeparator = '-';

    protected static function bootHasSlug(): void
    {
        static::creating(
            static function (self $model) {
                $model->generateSlug();
            }
        );

        static::updating(
            static function (self $model) {
                $model->generateSlug();
            }
        );
    }

    protected function generateSlug(): void
    {
        $this->{$this->slugColumn} = Str::slug($this->{$this->slugOriginColumn}, $this->slugSeparator);
    }
}
