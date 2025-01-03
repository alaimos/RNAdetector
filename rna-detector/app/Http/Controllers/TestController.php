<?php

namespace App\Http\Controllers;

use App\Http\Requests\DataTableRequest;
use App\Services\DataTable\Adapters\CollectionAdapter;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class TestController extends Controller
{
    public function generateTags(): array
    {
        $tags = [];
        for ($i = 0; $i < 1000; $i++) {
            $tag = 'Tag '.$i;
            $tags[] = trim($tag);
        }

        return $tags;
    }

    /**
     * Generate 1000 datasets with tags (dataset $i will have $i tags from tag $i to tag ($i+3) % 1000.)
     *
     * @param  array<string>  $tags
     * @return Collection<array{id: int, name: string, tags: array<string>, data: int}>
     */
    public function generateDataset(array $tags): Collection
    {
        $dataset = [];
        for ($i = 0; $i < 1000; $i++) {
            $dataset[] = [
                'id' => $i,
                'name' => 'Dataset '.$i,
                'tags' => array_slice($tags, $i, 4),
                'data' => $i + 10,
            ];
        }

        return collect($dataset);
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(DataTableRequest $request, DataTableService $service): \Inertia\Response
    {
        $tags = $this->generateTags();
        $dataset = $this->generateDataset($tags);
        $service
            ->using(CollectionAdapter::class)
            ->withConfig([
                'sortableColumns' => ['id', 'name', 'data'],
                'globalFilterColumns' => [
                    'name' => fn ($value, $filter) => str_contains($value, $filter),
                ],
                'columnFilter' => [
                    'tags' => fn (Collection $collection, array $value) => $collection->filter(fn ($row) => count(array_intersect($row['tags'], $value)) > 0),
                ],
            ])
            ->on($dataset);

        return Inertia::render('Test', [
            'tags' => fn () => $tags,
            'datasets' => fn () => $service->handle($request),
            'state' => fn () => $request->getState(),
        ]);
    }
}
