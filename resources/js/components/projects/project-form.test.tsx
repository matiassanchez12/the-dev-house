import { render, screen } from '@testing-library/react'
import type {
    ButtonHTMLAttributes,
    ComponentProps,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode,
    TextareaHTMLAttributes,
} from 'react'
import type { Tech, TechCategory } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { ProjectForm } from './project-form'

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
    ),
}))

vi.mock('@/components/ui/input', () => ({
    Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
        <label {...props}>{children}</label>
    ),
}))

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}))

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        id,
    }: {
        checked?: boolean
        onCheckedChange?: (checked: boolean) => void
        id?: string
    }) => (
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
}))

vi.mock('@/components/ui/separator', () => ({
    Separator: () => <hr />,
}))

vi.mock('@/components/ui/form-error', () => ({
    FormError: ({ message }: { message?: string }) =>
        message ? <div role="alert">{message}</div> : null,
}))

vi.mock('@/components/projects/image-uploader', () => ({
    ImageUploader: () => <div data-testid="image-uploader" />,
}))

describe('ProjectForm', () => {
    it('organizes selectable techs by category', () => {
        render(
            <ProjectForm
                mode="create"
                techs={[
                    buildTech({ id: 1, name: 'React', slug: 'react', category: 'frontend' }),
                    buildTech({ id: 2, name: 'Laravel', slug: 'laravel', category: 'backend' }),
                    buildTech({
                        id: 3,
                        name: 'TypeScript',
                        slug: 'typescript',
                        category: 'languages',
                    }),
                ]}
                form={buildForm()}
                onSubmit={vi.fn()}
                cancelUrl="/projects"
                submitLabel="Create project"
            />,
        )

        expect(screen.getByText('Frontend')).toBeInTheDocument()
        expect(screen.getByText('Backend')).toBeInTheDocument()
        expect(screen.getByText('Languages')).toBeInTheDocument()
        expect(screen.getByLabelText('React')).toBeInTheDocument()
        expect(screen.getByLabelText('Laravel')).toBeInTheDocument()
        expect(screen.getByLabelText('TypeScript')).toBeInTheDocument()
    })
})

function buildForm(): ComponentProps<typeof ProjectForm>['form'] {
    return {
        data: {
            title: '',
            description: '',
            vision: '',
            techs: [] as number[],
            repository_url: '',
            demo_url: '',
            images: [] as File[],
            remove_images: [] as string[],
        },
        setData: vi.fn(),
        processing: false,
        errors: {},
    } as unknown as ComponentProps<typeof ProjectForm>['form']
}

function buildTech(
    overrides: Partial<{
        id: number
        name: string
        slug: string
        category: TechCategory
    }> = {},
): Tech {
    return {
        id: 1,
        name: 'React',
        slug: 'react',
        category: 'frontend',
        created_at: '2026-07-26T00:00:00.000Z',
        updated_at: '2026-07-26T00:00:00.000Z',
        ...overrides,
    }
}
