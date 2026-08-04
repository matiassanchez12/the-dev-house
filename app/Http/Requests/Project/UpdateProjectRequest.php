<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use App\Models\Tech;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProjectRequest extends FormRequest
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
        $projectId = $this->route('project')?->id ?? null;

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Project::class, 'title')->ignore($projectId),
            ],
            'description' => [
                'required',
                'string',
                'max:1000',
            ],
            'vision' => [
                'nullable',
                'string',
            ],
            'techs' => [
                'required',
                'array',
                'min:1',
            ],
            'techs.*' => [
                'exists:' . (new Tech)->getTable() . ',id',
            ],
            'repository_url' => [
                'nullable',
                'url',
            ],
            'demo_url' => [
                'nullable',
                'url',
            ],
            'images' => [
                'nullable',
                'array',
                'max:5',
            ],
            'images.*' => [
                'image',
                'max:2048',
            ],
            'remove_images' => [
                'nullable',
                'array',
            ],
            'remove_images.*' => [
                'string',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->has('images')) {
                return;
            }

            $newImagesCount = $this->newImagesCount();

            if ($newImagesCount === 0) {
                return;
            }

            $project = $this->route('project');
            $existingImages = $project instanceof Project ? ($project->images ?? []) : [];
            $removeImages = $this->validatedRemoveImages();
            $remainingExistingImages = count($existingImages) - count(array_intersect($existingImages, $removeImages));

            if ($remainingExistingImages + $newImagesCount > 5) {
                $validator->errors()->add('images', 'No puedes subir más de 5 imágenes.');
            }
        });
    }

    /**
     * @return array<string>
     */
    private function validatedRemoveImages(): array
    {
        $removeImages = $this->input('remove_images', []);

        return is_array($removeImages)
            ? array_values(array_filter($removeImages, fn (mixed $image): bool => is_string($image)))
            : [];
    }

    private function newImagesCount(): int
    {
        $images = $this->file('images', []);

        if (is_array($images)) {
            return count($images);
        }

        return $images === null ? 0 : 1;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es requerido.',
            'title.unique' => 'Ya existe un proyecto con este título.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            'description.required' => 'La descripción es requerida.',
            'description.max' => 'La descripción no puede exceder 1000 caracteres.',
            'techs.required' => 'Debes seleccionar al menos una tecnología.',
            'techs.min' => 'Debes seleccionar al menos una tecnología.',
            'techs.*.exists' => 'La tecnología seleccionada no es válida.',
            'repository_url.url' => 'La URL del repositorio debe ser una URL válida.',
            'demo_url.url' => 'La URL de la demo debe ser una URL válida.',
            'images.max' => 'No puedes subir más de 5 imágenes.',
            'images.*.image' => 'Cada archivo debe ser una imagen.',
            'images.*.max' => 'Cada imagen no puede exceder 2MB.',
        ];
    }
}
