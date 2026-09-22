<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveStep4Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'join_requests' => [
                'nullable',
                'array',
            ],
            'join_requests.*' => [
                'integer',
            ],
            'idea_slug' => [
                'nullable',
                'string',
                Rule::exists('project_ideas', 'slug')->where('is_published', true),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'join_requests.array' => 'El campo join_requests debe ser un arreglo.',
            'join_requests.*.integer' => 'Cada ID de proyecto debe ser un número entero.',
            'idea_slug.exists' => 'La idea seleccionada no es válida.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'join_requests' => 'solicitudes a proyectos',
            'join_requests.*' => 'proyecto',
            'idea_slug' => 'idea seleccionada',
        ];
    }
}
