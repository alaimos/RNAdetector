<?php

namespace App\Services;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Adapter;
use Illuminate\Pipeline\Pipeline;

/**
 * @template Builder
 * @template GlobalFilterClosure of \Closure
 * @template Output
 */
final class DataTableService
{
    /**
     * @var Adapter<Builder, GlobalFilterClosure, Output>
     */
    private Adapter $adapter;

    /**
     * @var Builder
     */
    private $builder;

    /**
     * Set the adapter to use.
     *
     * @param  class-string  $adapterClass
     * @return $this
     */
    public function using(string $adapterClass): self
    {
        $this->adapter = self::makeAdapter($adapterClass);

        return $this;
    }

    /**
     * Set the configuration for the adapter.
     *
     * @param  array{globalFilterColumns?: array<string,\Closure>, columnFilter?: array<string,\Closure(Builder $builder,array<string> $value):Builder>, sortableColumns?: array<string>}  $config
     * @return $this
     */
    public function withConfig(array $config): self
    {
        $this->adapter->configure($config);

        return $this;
    }

    /**
     * Set the builder to use.
     *
     * @param  Builder  $builder
     * @return $this
     */
    public function on($builder): self
    {
        $this->builder = $builder;

        return $this;
    }

    /**
     * Handle the request.
     *
     * @return array{data: array<Output>, count: int}
     */
    public function handle(DataTableRequest $request): array
    {
        $filterPipes = $this->adapter->getFilterPipes($request);
        $outputPipes = $this->adapter->getOutputPipes($request);
        $filteredBuilder = app(Pipeline::class)
            ->send($this->builder)
            ->through($filterPipes)
            ->thenReturn();
        $outputBuilder = app(Pipeline::class)
            ->send($filteredBuilder)
            ->through($outputPipes)
            ->thenReturn();

        return [
            'data' => $this->adapter->adaptOutput($outputBuilder, $request),
            'count' => $this->adapter->getCount($filteredBuilder, $request),
        ];
    }

    /**
     * @param  class-string  $adapterClass
     * @return Adapter<Builder, GlobalFilterClosure, Output>
     */
    private static function makeAdapter(string $adapterClass): Adapter
    {
        return app($adapterClass);
    }
}
