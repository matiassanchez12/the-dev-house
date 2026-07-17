<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationSettingsRequest extends FormRequest
{
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
            'collaboration_emails' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'collaboration_emails.required' => 'Debés indicar si querés recibir correos opcionales de colaboración.',
            'collaboration_emails.boolean' => 'El valor de "correos opcionales de colaboración" debe ser verdadero o falso.',
        ];
    }
}
