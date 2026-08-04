import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ComponentProps, type ReactNode } from 'react'
import {
    createProjectFormData,
    type ProjectFormData,
    type ProjectFormSetData,
} from './project-form-contract'
import type { Project } from '@/types'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ProjectForm } from './project-form'
import { toast } from 'sonner'

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

vi.mock('@/components/ui/image-gallery-dialog', () => ({
    ImageGalleryDialog: () => null,
}))

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}))

beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
        writable: true,
        value: vi.fn(() => 'blob:preview-image'),
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
        writable: true,
        value: vi.fn(),
    })
})

describe('ProjectForm media behavior', () => {
    it('writes newly selected files into form.data.images through the uploader input', async () => {
        const user = userEvent.setup()
        const setData = vi.fn()

        render(
            <ProjectForm
                mode="create"
                techs={[]}
                form={buildForm({ setData })}
                onSubmit={vi.fn()}
                cancelUrl="/projects"
                submitLabel="Create project"
            />,
        )

        const selectedFiles = [
            new File(['cover'], 'cover.png', { type: 'image/png' }),
            new File(['detail'], 'detail.png', { type: 'image/png' }),
        ]

        await user.upload(
            screen.getByLabelText('Seleccionar imágenes del proyecto'),
            selectedFiles,
        )

        expect(setData).toHaveBeenCalledWith('images', selectedFiles)
    })

    it('allows one new upload when edit mode already has four retained images', async () => {
        const user = userEvent.setup()
        const toastError = vi.mocked(toast.error)
        toastError.mockClear()

        renderStatefulProjectForm({
            mode: 'edit',
            project: {
                ...buildProject(),
                images: [
                    { path: 'one.png', url: 'https://example.com/one.png' },
                    { path: 'two.png', url: 'https://example.com/two.png' },
                    { path: 'three.png', url: 'https://example.com/three.png' },
                    { path: 'four.png', url: 'https://example.com/four.png' },
                ],
            },
            techs: [],
            onSubmit: vi.fn(),
            cancelUrl: '/projects/example',
            submitLabel: 'Save',
        })

        const selectedFile = new File(['five'], 'five.png', { type: 'image/png' })

        await user.upload(screen.getByLabelText('Seleccionar imágenes del proyecto'), selectedFile)

        expect(screen.getByText('Imágenes seleccionadas (1)')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'five.png' })).toBeInTheDocument()
        expect(toastError).not.toHaveBeenCalled()
    })

    it('accepts a later valid image after an invalid file when one edit slot remains', async () => {
        const user = userEvent.setup({ applyAccept: false })
        const toastError = vi.mocked(toast.error)
        toastError.mockClear()

        renderStatefulProjectForm({
            mode: 'edit',
            project: {
                ...buildProject(),
                images: [
                    { path: 'one.png', url: 'https://example.com/one.png' },
                    { path: 'two.png', url: 'https://example.com/two.png' },
                    { path: 'three.png', url: 'https://example.com/three.png' },
                    { path: 'four.png', url: 'https://example.com/four.png' },
                ],
            },
            techs: [],
            onSubmit: vi.fn(),
            cancelUrl: '/projects/example',
            submitLabel: 'Save',
        })

        await user.upload(screen.getByLabelText('Seleccionar imágenes del proyecto'), [
            new File(['invalid'], 'invalid.txt', { type: 'text/plain' }),
            new File(['five'], 'five.png', { type: 'image/png' }),
        ])

        expect(screen.getByText('Imágenes seleccionadas (1)')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'five.png' })).toBeInTheDocument()
        expect(toastError).toHaveBeenCalledWith('invalid.txt no es una imagen válida')
        expect(toastError).not.toHaveBeenCalledWith('Máximo 5 imágenes permitidas')
    })

    it('blocks new uploads when edit mode already has five retained images', async () => {
        const user = userEvent.setup()
        const toastError = vi.mocked(toast.error)
        toastError.mockClear()

        renderStatefulProjectForm({
            mode: 'edit',
            project: {
                ...buildProject(),
                images: [
                    { path: 'one.png', url: 'https://example.com/one.png' },
                    { path: 'two.png', url: 'https://example.com/two.png' },
                    { path: 'three.png', url: 'https://example.com/three.png' },
                    { path: 'four.png', url: 'https://example.com/four.png' },
                    { path: 'five.png', url: 'https://example.com/five.png' },
                ],
            },
            techs: [],
            onSubmit: vi.fn(),
            cancelUrl: '/projects/example',
            submitLabel: 'Save',
        })

        await user.upload(
            screen.getByLabelText('Seleccionar imágenes del proyecto'),
            new File(['six'], 'six.png', { type: 'image/png' }),
        )

        expect(screen.queryByText('Imágenes seleccionadas (1)')).not.toBeInTheDocument()
        expect(screen.queryByRole('img', { name: 'six.png' })).not.toBeInTheDocument()
        expect(toastError).toHaveBeenCalledWith('Máximo 5 imágenes permitidas')
    })

    it('allows replacing a removed existing image in the same edit session', async () => {
        const user = userEvent.setup()
        const toastError = vi.mocked(toast.error)
        toastError.mockClear()

        renderStatefulProjectForm({
            mode: 'edit',
            project: {
                ...buildProject(),
                images: [
                    { path: 'one.png', url: 'https://example.com/one.png' },
                    { path: 'two.png', url: 'https://example.com/two.png' },
                    { path: 'three.png', url: 'https://example.com/three.png' },
                    { path: 'four.png', url: 'https://example.com/four.png' },
                    { path: 'five.png', url: 'https://example.com/five.png' },
                ],
            },
            techs: [],
            onSubmit: vi.fn(),
            cancelUrl: '/projects/example',
            submitLabel: 'Save',
        })

        await user.click(screen.getByRole('button', { name: 'Eliminar imagen actual 1' }))

        expect(screen.getAllByRole('button', { name: /^Eliminar imagen actual \d+$/ })).toHaveLength(4)

        await user.upload(
            screen.getByLabelText('Seleccionar imágenes del proyecto'),
            new File(['replacement'], 'replacement.png', { type: 'image/png' }),
        )

        expect(screen.getByText('Imágenes seleccionadas (1)')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'replacement.png' })).toBeInTheDocument()
        expect(toastError).not.toHaveBeenCalled()
    })

    it('shows only remaining edit images and appends removals through the rendered controls', async () => {
        const user = userEvent.setup()
        const setData = vi.fn()

        render(
            <ProjectForm
                mode="edit"
                project={{
                    ...buildProject(),
                    images: [
                        { path: 'cover.png', url: 'https://example.com/cover.png' },
                        { path: 'detail.png', url: 'https://example.com/detail.png' },
                    ],
                }}
                techs={[]}
                form={buildForm({
                    setData,
                    data: {
                        remove_images: ['cover.png'],
                    },
                })}
                onSubmit={vi.fn()}
                cancelUrl="/projects/example"
                submitLabel="Save"
            />,
        )

        expect(screen.getByRole('img', { name: 'Imagen 1' })).toHaveAttribute(
            'src',
            'https://example.com/detail.png',
        )
        expect(screen.queryByRole('img', { name: 'Imagen 2' })).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Eliminar imagen actual 1' }))

        expect(setData).toHaveBeenCalledWith('remove_images', ['cover.png', 'detail.png'])
    })
})

function buildForm(
    overrides: Partial<{
        data: Partial<ProjectFormData>
        setData: ComponentProps<typeof ProjectForm>['form']['setData']
        processing: boolean
        errors: ComponentProps<typeof ProjectForm>['form']['errors']
    }> = {},
): ComponentProps<typeof ProjectForm>['form'] {
    return {
        data: createProjectFormData(overrides.data),
        setData: overrides.setData ?? vi.fn(),
        processing: overrides.processing ?? false,
        errors: overrides.errors ?? {},
    } as unknown as ComponentProps<typeof ProjectForm>['form']
}

function renderStatefulProjectForm(props: Omit<ComponentProps<typeof ProjectForm>, 'form'>) {
    return render(<StatefulProjectForm {...props} />)
}

function StatefulProjectForm(props: Omit<ComponentProps<typeof ProjectForm>, 'form'>) {
    const [data, setData] = useState(createProjectFormData())
    const handleSetData: ProjectFormSetData = (key, value) => {
        setData((current) => ({
            ...current,
            [key]: value,
        }))
    }

    return (
        <ProjectForm
            {...props}
            form={{
                data,
                setData: handleSetData,
                processing: false,
                errors: {},
            } as unknown as ComponentProps<typeof ProjectForm>['form']}
        />
    )
}

function buildProject(): Project {
    return {
        id: 1,
        user_id: 1,
        title: 'Example project',
        slug: 'example-project',
        description: 'Example description',
        vision: null,
        repository_url: null,
        demo_url: null,
        status: 'open',
        images: [],
        techs: [],
        created_at: '2026-07-26T00:00:00.000Z',
        updated_at: '2026-07-26T00:00:00.000Z',
    }
}
