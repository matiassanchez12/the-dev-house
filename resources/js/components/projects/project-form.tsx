import { Separator } from '@/components/ui/separator'
import { ProjectFormData, toggleTechSelection } from '@/components/projects/project-form-contract'
import {
    ProjectDetailsSection,
    ProjectFormActions,
    ProjectLinksSection,
    ProjectMediaSection,
    ProjectTechSelector,
} from '@/components/projects/project-form-sections'
import { Tech, Project as ProjectType } from '@/types'

interface ProjectFormProps {
    mode: 'create' | 'edit'
    project?: ProjectType & { techs?: Tech[] }
    techs: Tech[]
    form: ReturnType<typeof import('@inertiajs/react').useForm<ProjectFormData>>
    onSubmit: (e: React.FormEvent) => void
    cancelUrl: string
    submitLabel: string
}

export function ProjectForm({
    mode,
    project,
    techs,
    form,
    onSubmit,
    cancelUrl,
    submitLabel,
}: ProjectFormProps) {
    const { data, setData, processing, errors } = form

    const handleTechChange = (techId: number, checked: boolean) => {
        setData('techs', toggleTechSelection(data.techs, techId, checked))
    }

    const handleImagesChange = (files: File[]) => {
        setData('images', files)
    }

    const handleRemoveExistingImage = (imagePath: string) => {
        setData('remove_images', [...(data.remove_images ?? []), imagePath])
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <ProjectDetailsSection data={data} errors={errors} setData={setData} />

            <Separator />

            <ProjectTechSelector
                techs={techs}
                selectedTechIds={data.techs}
                error={errors.techs}
                onToggle={handleTechChange}
            />

            <Separator />

            <ProjectLinksSection data={data} errors={errors} setData={setData} />

            <Separator />

            <ProjectMediaSection
                mode={mode}
                project={project}
                data={data}
                error={errors.images}
                onFilesChange={handleImagesChange}
                onRemoveExistingImage={handleRemoveExistingImage}
            />

            <ProjectFormActions
                cancelUrl={cancelUrl}
                processing={processing}
                submitLabel={submitLabel}
            />
        </form>
    )
}
