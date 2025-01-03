<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class DataTableRequest extends FormRequest
{
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
     * @return array<string, mixed>
     */
    public function getState(): array
    {
        return [
            'page' => (int) $this->page,
            'per_page' => (int) $this->per_page,
            'global_filter' => $this->global_filter,
            'column_filters' => $this->column_filters,
            'sorting' => $this->sorting,
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('column_filters')) {
            $original_column_filters = $this->column_filters ?? [];
            if (! is_array($original_column_filters)) {
                return;
            }
            $column_filters = collect($original_column_filters)->mapWithKeys(static fn ($data, $key) => [
                $key => is_array($data) ? $data : [$data],
            ])->toArray();
            $this->merge([
                'column_filters' => $column_filters,
            ]);
        }
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'page' => $this->page ?? 1,
            'per_page' => $this->per_page ?? 10,
            'global_filter' => $this->global_filter ?? '',
            'column_filters' => $this->column_filters ?? [],
            'sorting' => $this->sorting ?? [],
        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        abort(422, $validator->errors()->toJson());
    }
}
