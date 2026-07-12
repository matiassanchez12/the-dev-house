<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrivacyRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('phone')) {
            return;
        }

        $phone = $this->input('phone');

        if ($phone === null) {
            return;
        }

        if (is_string($phone)) {
            $phone = trim($phone);
        }

        $this->merge([
            'phone' => $phone === '' ? null : $phone,
        ]);
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'show_email' => ['sometimes', 'boolean'],
            'show_phone' => ['sometimes', 'boolean'],
            'is_discoverable' => ['sometimes', 'boolean'],
            'show_activity' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.max' => 'El teléfono no puede exceder 30 caracteres.',
            'phone.regex' => 'El teléfono solo puede contener números, espacios, paréntesis, + y -.',
            'show_email.boolean' => 'El valor de "mostrar email" debe ser verdadero o falso.',
            'show_phone.boolean' => 'El valor de "mostrar teléfono" debe ser verdadero o falso.',
            'is_discoverable.boolean' => 'El valor de "visible en el directorio" debe ser verdadero o falso.',
            'show_activity.boolean' => 'El valor de "mostrar actividad" debe ser verdadero o falso.',
        ];
    }
}
