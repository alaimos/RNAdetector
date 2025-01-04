<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @property int $page
 * @property int $per_page
 * @property string|null $global_filter
 * @property array<string,array<string>>|null $column_filters
 * @property array<string,"asc"|"desc">|null $sorting
 */
class DataTableRequest extends FormRequest
{
    private const int DEFAULT_PAGE = 1;

    private const int DEFAULT_PER_PAGE = 10;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1'],
            'global_filter' => ['sometimes', 'string'],
            'column_filters' => ['sometimes', 'array'],
            'column_filters.*' => ['array'],
            'sorting' => ['sometimes', 'array'],
            'sorting.*' => ['in:asc,desc'],
        ];
    }

    /**
     * Get the state of this request.
     *
     * @return array{page: int, per_page: int, global_filter?: string|null, column_filters?: array<string,array<string>>|null, sorting?: array<string,"asc"|"desc">|null}
     */
    public function getState(): array
    {
        return $this->only(['page', 'per_page', 'global_filter', 'column_filters', 'sorting']);
    }

    protected function prepareForValidation(): void
    {
        $toMerge = [
            'page' => (int) $this->input('page', self::DEFAULT_PAGE),
            'per_page' => (int) $this->input('per_page', self::DEFAULT_PER_PAGE),
        ];
        if ($this->has('column_filters')) {
            $original_column_filters = $this->input('column_filters', []);
            if (is_array($original_column_filters)) {
                $column_filters = collect($original_column_filters)->mapWithKeys(
                    static fn ($data, $key) => [
                        $key => is_array($data) ? $data : [$data],
                    ]
                )->toArray();
                $toMerge['column_filters'] = $column_filters;
            }
        }
        $this->merge($toMerge);
    }

    protected function passedValidation(): void
    {
//        $this->merge([
//            //'global_filter' => $this->global_filter ?? '',
//            'column_filters' => $this->column_filters ?? [],
//            'sorting' => $this->sorting ?? [],
//        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        abort(422, $validator->errors()->toJson());
    }
}
