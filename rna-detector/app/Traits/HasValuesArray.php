<?php

namespace App\Traits;

/**
 * @method static \UnitEnum[] cases()
 */
trait HasValuesArray
{
    /**
     * Get the values of the enum.
     *
     * @return array<string>
     */
    public static function toValuesArray(): array
    {
        return array_column(self::cases(), 'value');
    }
}
