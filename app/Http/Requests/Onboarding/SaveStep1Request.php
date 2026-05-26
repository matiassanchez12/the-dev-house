<?php

namespace App\Http\Requests\Onboarding;

use App\Models\Tech;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveStep1Request extends FormRequest
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
            'techs' => [
                'required',
                'array',
                'min:1',
            ],
            'techs.*.id' => [
                'required',
                'exists:' . (new Tech)->getTable() . ',id',
            ],
            'techs.*.proficiency' => [
                'required',
                'integer',
                'between:1,5',
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
            'techs.required' => 'Debes seleccionar al menos una tecnología.',
            'techs.array' => 'El formato de tecnologías es inválido.',
            'techs.min' => 'Debes seleccionar al menos una tecnología.',
            'techs.*.id.required' => 'Cada tecnología debe tener un ID válido.',
            'techs.*.id.exists' => 'La tecnología seleccionada no existe.',
            'techs.*.proficiency.required' => 'Cada tecnología debe tener un nivel de proficiencia.',
            'techs.*.proficiency.integer' => 'El nivel de proficiencia debe ser un número entero.',
            'techs.*.proficiency.between' => 'El nivel de proficiencia debe estar entre 1 y 5.',
        ];
    }
}
