<?php

namespace App\Http\Requests\Profile;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSocialLinksRequest extends FormRequest
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
            ],
            'links.*.id' => [
                'nullable',
                'integer',
                'exists:social_links,id',
            ],
            'links.*.platform' => [
                'required',
                'string',
                'in:github,linkedin,twitter,website,youtube,discord,stackoverflow',
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
            'links.required' => 'Debes incluir los links sociales.',
            'links.array' => 'El formato de links es inválido.',
            'links.*.platform.required' => 'Cada link debe especificar una plataforma.',
            'links.*.platform.in' => 'La plataforma debe ser una de las plataformas soportadas.',
            'links.*.url.required' => 'Cada link debe tener una URL.',
            'links.*.url.url' => 'La URL debe tener un formato válido.',
            'links.*.url.max' => 'La URL no debe exceder los 2048 caracteres.',
        ];
    }
}
