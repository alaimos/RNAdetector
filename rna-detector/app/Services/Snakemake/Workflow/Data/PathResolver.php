<?php

namespace App\Services\Snakemake\Workflow\Data;

use App\Models\Data;
use App\Models\Dataset;
use App\Services\Snakemake\Workflow\Contracts\Data\DataPathResolver;
use App\Services\Snakemake\Workflow\Contracts\Data\ResolverInvokable;
use InvalidArgumentException;
use Override;

class PathResolver implements DataPathResolver
{
    /**
     * @var array<string, (\Closure(string,Data,Dataset): ?string)|\App\Services\Snakemake\Workflow\Contracts\Data\ResolverInvokable>
     */
    protected array $resolvers;

    /**
     * Create a new instance.
     *
     * @param  array<string, (\Closure(string,Data,Dataset): ?string)|\App\Services\Snakemake\Workflow\Contracts\Data\ResolverInvokable>  $resolvers
     */
    public function __construct(array $resolvers)
    {
        $this->resolvers = $resolvers;
    }

    /**
     * Resolve the path of a data file of a specific type relative to the workflow directory.
     * If the path is null, the data file will be ignored.
     */
    public function __invoke(string $type, string $contentName, Data $data, Dataset $dataset): ?string
    {
        if (! isset($this->resolvers[$type])) {
            return null;
        }

        return ($this->resolvers[$type])($contentName, $data, $dataset);
    }

    /**
     * Returns an array of the types of data files that can be resolved by this resolver.
     *
     * @return string[]
     */
    #[Override]
    public function resolvedTypes(): array
    {
        return array_keys($this->resolvers);
    }

    /**
     * Create a resolver that returns the path of a data file relative to the workflow directory.
     *
     * @param  mixed  ...$args  An array of resolvers or many resolver invokable.
     */
    #[Override]
    public static function from(...$args): static
    {
        if (! count($args)) {
            throw new InvalidArgumentException('At least one resolver must be provided.');
        }
        if (count($args) === 1 && is_array($args[0])) {
            return new static($args[0]); // @phpstan-ignore-line
        }
        $cleanedArgs = [];
        foreach ($args as $arg) {
            if (! $arg instanceof ResolverInvokable) {
                continue;
            }
            $cleanedArgs[$arg->type()] = $arg;
        }
        if (! count($cleanedArgs)) {
            throw new InvalidArgumentException('At least one resolver must be provided.');
        }

        return new static($cleanedArgs); // @phpstan-ignore-line
    }
}
