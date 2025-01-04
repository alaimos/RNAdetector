<?php

namespace App\Services\DataTable;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Contracts\Adapter;
use App\Services\DataTable\Contracts\OutputTransformer;
use App\Services\DataTable\Contracts\Pipe;
use Closure;
use Illuminate\Pipeline\Pipeline;

/**
 * @template Builder
 * @template TransformedOutput = DefaultOutput
 * @template DefaultOutput = array
 * @template GlobalFilterClosure of Closure = Closure
 */
final class DataTableService
{
    /**
     * @var Adapter<Builder, GlobalFilterClosure, DefaultOutput>
     */
    private Adapter $adapter;

    /**
     * @var Builder
     */
    private $builder;

    /**
     * @var array<Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>>
     */
    private array $customFilterPipes = [];

    /**
     * @var array<Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>>
     */
    private array $customOutputPipes = [];

    /**
     * @var null | Closure(DefaultOutput): TransformedOutput | OutputTransformer<DefaultOutput, TransformedOutput>
     */
    private null|Closure|OutputTransformer $outputTransformer = null;

    /**
     * Set the adapter to use.
     *
     * @param  Adapter<Builder, GlobalFilterClosure, DefaultOutput>|class-string  $adapterClass
     * @return $this
     */
    public function using(string|Adapter $adapterClass): self
    {
        if (is_string($adapterClass)) {
            $adapterClass = self::makeAdapter($adapterClass);
        }
        $this->adapter = $adapterClass;

        return $this;
    }

    /**
     * Set the configuration for the adapter.
     *
     * @param  array{globalFilterColumns?: array<string,Closure>, columnFilter?: array<string,Closure(Builder $builder,array<string> $value):Builder>, sortableColumns?: array<string>}  $config
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
     * Add a custom filter pipe.
     * A filter pipe applies some custom filtering logic to a builder.
     * The filtering logic is applied before counting the total number of records.
     * For example, a filter pipe could limit the records to those that belong to the authenticated user.
     *
     * @param  Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>|array<Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>>  $pipe
     * @return $this
     */
    public function withCustomFilterPipes(Closure|Pipe|array $pipe): self
    {
        if (! is_array($pipe)) {
            $pipe = [$pipe];
        }
        $this->customFilterPipes = array_merge($this->customFilterPipes, $pipe);

        return $this;
    }

    /**
     * Add a custom output pipe.
     * An output pipe applies some custom logic to the output of the builder.
     * The output logic is applied after counting the total number of records.
     * For example, an output pipe could add a new column to the output or load a relationship.
     *
     * @param  Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>|array<Closure(Builder,Closure(Builder): Builder): Builder|Pipe<Builder>>  $pipe
     * @return $this
     */
    public function withCustomOutputPipes(Closure|Pipe|array $pipe): self
    {
        if (! is_array($pipe)) {
            $pipe = [$pipe];
        }
        $this->customOutputPipes = array_merge($this->customOutputPipes, $pipe);

        return $this;
    }

    /**
     * Set the output transformer.
     * The output transformer transforms the output of the builder into a format that can be returned to the client.
     *
     * @param  Closure(DefaultOutput): TransformedOutput | OutputTransformer<DefaultOutput, TransformedOutput>  $outputTransformer
     * @return $this
     */
    public function withOutputTransformer(Closure|OutputTransformer $outputTransformer): self
    {
        $this->outputTransformer = $outputTransformer;

        return $this;
    }

    /**
     * Handle the request.
     *
     * @return \App\Services\DataTable\DataTableResponse<TransformedOutput>
     */
    public function handle(DataTableRequest $request): DataTableResponse
    {
        $filterPipes = $this->adapter->getFilterPipes($request);
        $outputPipes = $this->adapter->getOutputPipes($request);
        $filteredBuilder = app(Pipeline::class)
            ->send($this->builder)
            ->through([
                ...$filterPipes,
                ...$this->customFilterPipes,
            ])
            ->thenReturn();
        $outputBuilder = app(Pipeline::class)
            ->send($filteredBuilder)
            ->through([
                ...$outputPipes,
                ...$this->customOutputPipes,
            ])
            ->thenReturn();

        $output = $this->adapter->adaptOutput($outputBuilder, $request);
        if ($this->outputTransformer !== null) {
            $transformer = $this->outputTransformer;
            $output = $transformer($output);
        }
        /** @var TransformedOutput $output */
        return new DataTableResponse($output, $this->adapter->getCount($filteredBuilder, $request));
    }

    /**
     * @param  class-string  $adapterClass
     * @return Adapter<Builder, GlobalFilterClosure, DefaultOutput>
     */
    private static function makeAdapter(string $adapterClass): Adapter
    {
        return app($adapterClass);
    }
}
