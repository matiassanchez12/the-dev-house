<?php

namespace App\Http\Requests\Profile;

use App\Models\Tech;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompleteProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare incoming data for validation.
     */
    protected function prepareForValidation(): void
    {
        $techs = $this->input('techs');

        if (! is_string($techs)) {
            return;
        }

        $decoded = json_decode($techs, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $this->merge([
                'techs' => $decoded,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bio' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'avatar' => [
                'nullable',
                'image',
                'max:2048',
                'mimes:jpg,jpeg,png,webp',
            ],
            'techs' => [
                'nullable',
                'array',
            ],
            'techs.*.id' => [
                'required_with:techs',
                'exists:' . (new Tech)->getTable() . ',id',
            ],
            'techs.*.proficiency' => [
                'nullable',
                Rule::in(['basic', 'intermediate', 'advanced', 'expert', 'master']),
            ],
            'techs.*.years_experience' => [
                'nullable',
                'integer',
                'min:0',
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
            'bio.max' => 'La bio no puede exceder 1000 caracteres.',
            'avatar.image' => 'El avatar debe ser una imagen.',
            'avatar.max' => 'El avatar no puede exceder 2MB.',
            'avatar.mimes' => 'El avatar debe ser JPG, PNG o WEBP.',
            'techs.*.id.exists' => 'La tecnología seleccionada no es válida.',
            'techs.*.proficiency.in' => 'La proficiencia debe ser: basic, intermediate, advanced, expert o master.',
        ];
    }
}
