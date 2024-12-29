<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Avatar;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the datasets owned by the user.
     */
    public function datasets(): HasMany
    {
        return $this->hasMany(Dataset::class);
    }

    /**
     * Get the data owned by the user.
     */
    public function data(): HasMany
    {
        return $this->hasMany(Data::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The user's avatar.
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: static function (mixed $value, array $attributes) {
                return Avatar::create($attributes['name'])->toBase64();
            },
        )->shouldCache();
    }

    /**
     * Convert the model instance to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = parent::toArray();
        $data['avatar'] = $this->avatar;

        return $data;
    }
}
