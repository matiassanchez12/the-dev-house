import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormError } from '@/components/ui/form-error'
import type {
    ProjectFormData,
    ProjectFormFieldErrors,
    ProjectFormSetData,
} from '@/components/projects/project-form-contract'
import { ImageUploader } from '@/components/projects/image-uploader'
import { groupTechsByCategory } from '@/lib/tech-catalog'
import { Tech, Project as ProjectType } from '@/types'
import { cn } from '@/lib/utils'

const TITLE_MAX = 255
const DESCRIPTION_MAX = 1000

function Counter({ current, max }: { current: number; max: number }) {
    const ratio = current / max
    const isNearLimit = ratio >= 0.9

    return (
        <p
            className={cn(
                'mt-1 text-xs text-muted-foreground transition-colors',
                isNearLimit && 'text-destructive',
            )}
        >
            {current} / {max}
        </p>
    )
}

interface ProjectDetailsSectionProps {
    data: ProjectFormData
    errors: ProjectFormFieldErrors
    setData: ProjectFormSetData
}

export function ProjectDetailsSection({ data, errors, setData }: ProjectDetailsSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <Field id="title" label="Título *" error={errors.title}>
                    <Input
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Ej: Plataforma de E-commerce"
                        maxLength={TITLE_MAX}
                        required
                    />
                </Field>
                <Counter current={data.title.length} max={TITLE_MAX} />
            </div>

            <div>
                <Field id="description" label="Descripción *" error={errors.description}>
                    <Textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Describí de qué trata tu proyecto..."
                        rows={4}
                        maxLength={DESCRIPTION_MAX}
                        required
                    />
                </Field>
                <Counter current={data.description.length} max={DESCRIPTION_MAX} />
            </div>

            <Field id="vision" label="Visión del Proyecto (opcional)" error={errors.vision}>
                <Textarea
                    value={data.vision}
                    onChange={(e) => setData('vision', e.target.value)}
                    placeholder="¿Qué querés lograr con este proyecto a largo plazo?"
                    rows={3}
                />
            </Field>
        </div>
    )
}

interface ProjectTechSelectorProps {
    error?: string
    selectedTechIds: number[]
    techs: Tech[]
    onToggle: (techId: number, checked: boolean) => void
}

export function ProjectTechSelector({
    error,
    selectedTechIds,
    techs,
    onToggle,
}: ProjectTechSelectorProps) {
    const techGroups = groupTechsByCategory(techs)
    const errorId = error ? 'project-techs-error' : undefined

    return (
        <fieldset className="flex flex-col gap-3" aria-describedby={errorId}>
            <legend className="sr-only">Tecnologías Requeridas *</legend>

            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Tecnologías Requeridas *</p>
                {selectedTechIds.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {selectedTechIds.length} seleccionada
                        {selectedTechIds.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border p-3">
                {techGroups.map((group) => (
                    <section
                        key={group.key}
                        className="rounded-md border bg-muted/20 p-3"
                        aria-labelledby={`tech-group-${group.key}`}
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3
                                id={`tech-group-${group.key}`}
                                className="text-sm font-medium text-foreground"
                            >
                                {group.label}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {group.techs.length} tech{group.techs.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {group.techs.map((tech) => {
                                const isChecked = selectedTechIds.includes(tech.id)

                                return (
                                    <li key={tech.id}>
                                        <label
                                            htmlFor={`tech-${tech.id}`}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded-md border border-transparent p-2 transition-colors hover:bg-muted',
                                                isChecked && 'border-primary/20 bg-primary/5',
                                            )}
                                        >
                                            <Checkbox
                                                id={`tech-${tech.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    onToggle(tech.id, checked === true)
                                                }
                                            />
                                            <span className="text-sm select-none">{tech.name}</span>
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                ))}
            </div>

            <FormError id={errorId} message={error} />
        </fieldset>
    )
}

interface ProjectLinksSectionProps {
    data: ProjectFormData
    errors: ProjectFormFieldErrors
    setData: ProjectFormSetData
}

export function ProjectLinksSection({ data, errors, setData }: ProjectLinksSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field id="repository_url" label="Repositorio (opcional)" error={errors.repository_url}>
                <Input
                    type="url"
                    value={data.repository_url}
                    onChange={(e) => setData('repository_url', e.target.value)}
                    placeholder="https://github.com/..."
                />
            </Field>

            <Field id="demo_url" label="Demo (opcional)" error={errors.demo_url}>
                <Input
                    type="url"
                    value={data.demo_url}
                    onChange={(e) => setData('demo_url', e.target.value)}
                    placeholder="https://mi-proyecto.com"
                />
            </Field>
        </div>
    )
}

interface ProjectMediaSectionProps {
    mode: 'create' | 'edit'
    project?: ProjectType & { techs?: Tech[] }
    data: ProjectFormData
    error?: string
    onFilesChange: (files: File[]) => void
    onRemoveExistingImage: (imagePath: string) => void
}

export function ProjectMediaSection({
    mode,
    project,
    data,
    error,
    onFilesChange,
    onRemoveExistingImage,
}: ProjectMediaSectionProps) {
    const existingImages =
        mode === 'edit'
            ? (project?.images ?? []).filter(
                  (image) => !(data.remove_images ?? []).includes(image.path),
              )
            : []

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">
                {mode === 'edit' ? 'Imágenes del Proyecto' : 'Imágenes del Proyecto (opcional)'}
            </p>
            <div className="rounded-lg border bg-muted/10 p-4">
                <ImageUploader
                    files={data.images}
                    existingImages={existingImages}
                    onFilesChange={onFilesChange}
                    onRemoveExisting={mode === 'edit' ? onRemoveExistingImage : undefined}
                    error={error}
                />
            </div>
        </div>
    )
}

interface ProjectFormActionsProps {
    cancelUrl: string
    processing: boolean
    submitLabel: string
}

export function ProjectFormActions({
    cancelUrl,
    processing,
    submitLabel,
}: ProjectFormActionsProps) {
    return (
        <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={processing}>
                {processing ? 'Guardando...' : submitLabel}
            </Button>
            <Link href={cancelUrl}>
                <Button type="button" variant="outline">
                    Cancelar
                </Button>
            </Link>
        </div>
    )
}
