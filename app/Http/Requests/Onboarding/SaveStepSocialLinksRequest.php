<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveStepSocialLinksRequest extends FormRequest
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
            'links' => [
                'nullable',
                'array',
            ],
            'links.*.platform' => [
                'required_with:links',
                'string',
                'in:github,linkedin,twitter,website,youtube,discord,stackoverflow',
            ],
            'links.*.url' => [
                'required_with:links',
                'url',
                'max:2048',
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
            'links.array' => 'El formato de links es inválido.',
            'links.*.platform.required_with' => 'Cada link debe especificar una plataforma.',
            'links.*.platform.in' => 'La plataforma debe ser una de las plataformas soportadas.',
            'links.*.url.required_with' => 'Cada link debe tener una URL.',
            'links.*.url.url' => 'La URL debe tener un formato válido.',
            'links.*.url.max' => 'La URL no debe exceder los 2048 caracteres.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'links' => 'links profesionales',
            'links.*.platform' => 'plataforma',
            'links.*.url' => 'URL',
        ];
    }
}
