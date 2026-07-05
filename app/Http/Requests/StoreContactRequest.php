<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'satisfaction' => ['required', 'integer', 'between:1,5'],
            'understood_purpose' => ['required', Rule::in(['yes', 'partly', 'no'])],
            'would_join_project' => ['required', Rule::in(['yes', 'maybe', 'no'])],
            'missing_feature' => ['required', 'string', 'min:10', 'max:2000'],
            'tech_stack' => ['required', 'string', 'max:255'],
            'preferred_project_type' => ['required', Rule::in(['practice', 'portfolio', 'real'])],
            'improvements' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }
}
