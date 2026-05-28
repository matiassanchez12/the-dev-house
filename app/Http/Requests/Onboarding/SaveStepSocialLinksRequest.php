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
                'required',
                'array',
                'min:1',
            ],
            'links.*.platform' => [
                'required',
                'string',
                'in:github,linkedin,twitter,website',
            ],
            'links.*.url' => [
                'required',
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
            'links.required' => 'Debes incluir al menos un link social.',
            'links.array' => 'El formato de links es inválido.',
            'links.min' => 'Debes incluir al menos un link social.',
            'links.*.platform.required' => 'Cada link debe especificar una plataforma.',
            'links.*.platform.in' => 'La plataforma debe ser github, linkedin, twitter o website.',
            'links.*.url.required' => 'Cada link debe tener una URL.',
            'links.*.url.url' => 'La URL debe tener un formato válido.',
            'links.*.url.max' => 'La URL no debe exceder los 2048 caracteres.',
        ];
    }
}
