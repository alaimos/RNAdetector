<?php

namespace App\Services\Mamba\Command;

use App\Services\Mamba\Contracts\ConvertibleToCommand;
use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Override;

/**
 * @implements Arrayable<string, mixed>
 */
final class Flag implements Arrayable, ConvertibleToCommand
{
    /**
     * The name of the flag.
     */
    public string $flag;

    /**
     * The values of the flag.
     *
     * @var string|array|bool|null|(Closure(): string|array|bool|null)
     */
    public string|array|bool|Closure|null $value;

    /**
     * Whether the flag is repeatable or multivalued.
     * This flag is used to determine how the flag should
     * be added to the command when it contains multiple values.
     * A repeatable flag is added multiple times to the command.
     * A multivalued flag is added once to the command with all values
     * separated by a separator.
     */
    public bool $repeteable = false;

    /**
     * The separator used to separate multiple values of a multivalued flag.
     */
    public string $valuesSeparator = ' ';

    /**
     * The separator used to separate the flag and its value.
     * By default, whe use the space (-flag value).
     */
    public string $flagValueSeparator = ' ';

    public function __construct(string $flag, string|array|bool|null|Closure $value = true)
    {
        $this->flag = $flag;
        $this->value = $value;
    }

    /**
     * Create a new instance of the flag.
     *
     * @param  null|bool|string|array<null|bool|string>|(\Closure(): bool|string|null)  $value
     * @return static
     */
    public static function make(string $flag, string|array|bool|null|Closure $value = true): self
    {
        return new self($flag, $value);
    }

    /**
     * Create a new instance of the JSON output flag.
     */
    public static function makeJson(string $jsonFlag = '--json'): self
    {
        return new self($jsonFlag, true);
    }

    /**
     * Mark the flag to be repeatable.
     *
     * @return $this
     */
    public function repeatable(): self
    {
        $this->repeteable = true;

        return $this;
    }

    /**
     * Set the separator used to separate multiple values of a multivalued flag.
     *
     * @return $this
     */
    public function usingValuesSeparator(string $separator): self
    {
        $this->valuesSeparator = $separator;

        return $this;
    }

    /**
     * Set the separator used to separate the flag and its value.
     *
     * @return $this
     */
    public function usingFlagValueSeparator(string $separator): self
    {
        $this->flagValueSeparator = $separator;

        return $this;
    }

    /**
     * Merge the flag with another flag.
     * If the flags are different, the flag is not merged.
     * If one of the values is a closure, the merge is postponed.
     *
     * @return $this
     */
    public function merge(Flag $flag): self
    {
        if ($this->flag !== $flag->flag) {
            return $this;
        }

        // If one of the values is a closure, we postpone the merge
        // by replacing the value with a closure that will merge the original values
        // when executed.
        if ($this->value instanceof Closure || $flag->value instanceof Closure) {
            $thisValue = $this->value;
            $flagValue = $flag->value;
            $this->value = function () use ($thisValue, $flagValue) {
                return $this->mergeValues($thisValue, $flagValue);
            };
        } else {
            $this->value = $this->mergeValues($this->value, $flag->value);
        }

        return $this;
    }

    /**
     * Get the instance as an array.
     *
     * @return array<string, mixed>
     */
    #[Override]
    public function toArray(): array
    {
        return [
            'flag' => $this->flag,
            'value' => $this->computeValue(),
            'repeteable' => $this->repeteable,
            'valueSeparator' => $this->valuesSeparator,
        ];
    }

    /**
     * Convert the element to an array of command arguments.
     */
    #[Override]
    public function toCommand(): ?array
    {
        $value = $this->computeValue();
        if ($value === null || $value === false) {
            return null;
        }
        if ($value === true) {
            return [$this->flag];
        }
        if (is_string($value)) {
            return $this->handleStringValue($value);
        }
        if ($this->repeteable) {
            return $this->handleRepeatableValue($value);
        }

        return $this->handleMultivaluedValue($value);
    }

    /**
     * Get the value of the flag.
     */
    private function computeValue(): string|array|bool|null
    {
        return ($this->value instanceof Closure) ? ($this->value)() : $this->value;
    }

    /**
     * Handle the case where the value of the flag is a string.
     */
    private function handleStringValue(string $value): array
    {
        if ($this->flagValueSeparator === ' ') {
            return [$this->flag, $value];
        }

        return [$this->flag.$this->flagValueSeparator.$value];
    }

    private function handleRepeatableValue(array $values): array
    {
        $result = [];
        foreach ($values as $value) {
            if ($this->flagValueSeparator === ' ') {
                $result[] = $this->flag;
                $result[] = $value;
            } else {
                $result[] = $this->flag.$this->flagValueSeparator.$value;
            }
        }

        return $result;
    }

    private function handleMultivaluedValue(array $values): array
    {
        if ($this->flagValueSeparator === ' ' && $this->valuesSeparator === ' ') {
            return [$this->flag, ...$values];
        }
        if ($this->flagValueSeparator === ' ') {
            return [$this->flag, implode($this->valuesSeparator, $values)];
        }

        return [$this->flag.$this->flagValueSeparator.implode($this->valuesSeparator, $values)];
    }

    /**
     * Merge two values.
     * If one of the values is null, the other value is returned.
     * If one of the values is a closure, the closure is executed and the result is used.
     * If the first value is a boolean, the second value is returned.
     * In all other cases, the values are merged into an array.
     */
    private function mergeValues(string|array|bool|Closure|null $value1, string|array|bool|Closure|null $value2)
    {
        if ($value1 instanceof Closure) {
            $value1 = $value1();
        }
        if ($value2 instanceof Closure) {
            $value2 = $value2();
        }
        if ($value1 === null) {
            return $value2;
        }
        if ($value2 === null) {
            return $value1;
        }
        if (is_bool($value1)) {
            return $value2;
        }
        if (is_string($value1)) {
            $value1 = [$value1];
        }
        if (is_string($value2)) {
            $value2 = [$value2];
        }

        return [...$value1, ...$value2];
    }
}
