export type ProjectFormData = {
    title: string
    description: string
    vision: string
    techs: number[]
    repository_url: string
    demo_url: string
    images: File[]
    remove_images?: string[]
    _method?: string
}

export type ProjectFormFieldErrors = Partial<Record<keyof ProjectFormData, string>>

export type ProjectFormSetData = <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K],
) => void

export function createProjectFormData(
    overrides: Partial<ProjectFormData> = {},
): ProjectFormData {
    return {
        title: '',
        description: '',
        vision: '',
        techs: [],
        repository_url: '',
        demo_url: '',
        images: [],
        remove_images: [],
        ...overrides,
    }
}

export function toggleTechSelection(techIds: number[], techId: number, checked: boolean) {
    if (checked) {
        return techIds.includes(techId) ? techIds : [...techIds, techId]
    }

    return techIds.filter((id) => id !== techId)
}
