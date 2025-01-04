<?php

namespace App\Services\DataTable;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Support\Collection;
use JsonSerializable;
use Override;

/**
 * @template TData
 */
final readonly class DataTableResponse implements Arrayable, Jsonable, JsonSerializable
{
    /**
     * @param  Collection<TData>  $data
     */
    public function __construct(public Collection $data, public int $count) {}

    /**
     * @return array{data: Collection<TData>, count: int}
     */
    #[Override]
    public function toArray(): array
    {
        return [
            'data' => $this->data,
            'count' => $this->count,
        ];
    }

    /**
     * @throws \JsonException
     */
    #[Override]
    public function toJson($options = 0): string
    {
        return json_encode($this->toArray(), JSON_THROW_ON_ERROR | $options);
    }

    #[Override]
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
