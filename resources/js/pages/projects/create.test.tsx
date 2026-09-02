import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProjectIdea } from '@/types'
import Create from './create'

vi.mock('@/components/seo', () => ({
    default: () => null,
}))

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children, header }: { children: ReactNode; header?: ReactNode }) => (
        <div>
            {header && <header>{header}</header>}
            <main>{children}</main>
        </div>
    ),
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

const postSpy = vi.fn()
const setDataSpy = vi.fn()
let formInitialOverride: Partial<Record<string, unknown>> = {}

vi.mock('@inertiajs/react', () => ({
    useForm: (initial: Record<string, unknown>) => {
        const [data, setData] = useState<Record<string, unknown>>({
            ...initial,
            ...formInitialOverride,
        })

        return {
            data,
            setData: (key: string, value: unknown) => {
                setDataSpy(key, value)
                setData((previous) => ({ ...previous, [key]: value }))
            },
            post: postSpy,
            processing: false,
            errors: {},
        }
    },
}))

vi.mock('@/components/projects/project-form', () => ({
    ProjectForm: ({
        form,
        onSubmit,
        submitLabel,
    }: {
        form: { data: Record<string, unknown> }
        onSubmit: (event: { preventDefault: () => void }) => void
        submitLabel: string
    }) => (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit(event)
            }}
        >
            <input id="title" readOnly value={String(form.data.title ?? '')} />
            <input id="description" readOnly value={String(form.data.description ?? '')} />
            <button type="submit">{submitLabel}</button>
        </form>
    ),
}))

function buildIdea(overrides: Partial<ProjectIdea> = {}): ProjectIdea {
    return {
        slug: 'clon-trello-kanban',
        title: 'Clon de Trello',
        summary: 'Un tablero kanban.',
        category: 'clones',
        difficulty: 'intermedio',
        prefillTitle: 'Clon de Trello para gestión kanban',
        prefillDescription: 'Construí un tablero kanban con listas y tarjetas arrastrables.',
        prefillVision: 'Un gestor de tareas simple para equipos pequeños.',
        techIds: [1, 2],
        ...overrides,
    }
}

const techs = [
    {
        id: 1,
        name: 'React',
        slug: 'react',
        category: 'frontend' as const,
        created_at: '',
        updated_at: '',
    },
    {
        id: 2,
        name: 'Laravel',
        slug: 'laravel',
        category: 'backend' as const,
        created_at: '',
        updated_at: '',
    },
]

const auth = { user: { id: 1, name: 'Ada' } }

beforeEach(() => {
    postSpy.mockClear()
    setDataSpy.mockClear()
    formInitialOverride = {}
    window.history.replaceState('', '', '/projects/create')
    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn((name: string) => `/${name}`),
    })
})

describe('projects/create inspiration block', () => {
    it('renders the block collapsed and lets the form submit without expanding', async () => {
        const user = userEvent.setup()

        render(<Create auth={auth} techs={techs} projectIdeas={[buildIdea()]} />)

        expect(
            screen.queryByRole('button', { name: 'Usar la idea: Clon de Trello' }),
        ).not.toBeInTheDocument()
        expect(screen.getByText(/Explorá ideas de proyectos/i)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Crear Proyecto' }))
        expect(postSpy).toHaveBeenCalledWith('/projects', expect.anything())
    })

    it('reveals grouped ideas on expand and omits empty category groups', async () => {
        const user = userEvent.setup()

        render(
            <Create
                auth={auth}
                techs={techs}
                projectIdeas={[
                    buildIdea({ slug: 'a', category: 'clones', title: 'Clon A' }),
                    buildIdea({ slug: 'b', category: 'herramientas-dev', title: 'Herramienta B' }),
                ]}
            />,
        )

        await user.click(screen.getByRole('button', { name: /Explorá ideas de proyectos/i }))

        expect(screen.getByText('Clones de apps conocidas')).toBeInTheDocument()
        expect(screen.getByText('Herramientas para devs')).toBeInTheDocument()
        expect(screen.queryByText('Alternativas open source')).not.toBeInTheDocument()
    })

    it('prefills exactly title, description, vision and techs on card click and never the link/image fields', async () => {
        const user = userEvent.setup()
        formInitialOverride = { title: 'Mi título editado a mano' }
        const idea = buildIdea()

        render(<Create auth={auth} techs={techs} projectIdeas={[idea]} />)

        await user.click(screen.getByRole('button', { name: /Explorá ideas de proyectos/i }))
        await user.click(screen.getByRole('button', { name: 'Usar la idea: Clon de Trello' }))

        const keys = setDataSpy.mock.calls.map((call) => call[0])
        expect(new Set(keys)).toEqual(new Set(['title', 'description', 'vision', 'techs']))
        expect(setDataSpy).toHaveBeenCalledWith('title', idea.prefillTitle)
        expect(setDataSpy).toHaveBeenCalledWith('description', idea.prefillDescription)
        expect(setDataSpy).toHaveBeenCalledWith('vision', idea.prefillVision)
        expect(setDataSpy).toHaveBeenCalledWith('techs', idea.techIds)
        expect(keys).not.toContain('repository_url')
        expect(keys).not.toContain('demo_url')
        expect(keys).not.toContain('images')
        expect(window.location.search).toBe('?idea=clon-trello-kanban')
    })

    it('deep-link prefill fills only pristine fields once and leaves an edited description untouched', () => {
        formInitialOverride = { description: 'Ya escribí mi propia descripción' }
        window.history.replaceState('', '', '/projects/create?idea=clon-trello-kanban')
        const idea = buildIdea()

        const view = render(<Create auth={auth} techs={techs} projectIdeas={[idea]} />)

        expect(setDataSpy).toHaveBeenCalledWith('title', idea.prefillTitle)
        expect(setDataSpy).toHaveBeenCalledWith('vision', idea.prefillVision)
        expect(setDataSpy).toHaveBeenCalledWith('techs', idea.techIds)
        expect(setDataSpy.mock.calls.map((call) => call[0])).not.toContain('description')

        const callsAfterMount = setDataSpy.mock.calls.length
        view.rerender(<Create auth={auth} techs={techs} projectIdeas={[idea]} />)
        expect(setDataSpy.mock.calls.length).toBe(callsAfterMount)
    })

    it('ignores an unknown deep-link slug without prefilling or erroring', () => {
        window.history.replaceState('', '', '/projects/create?idea=does-not-exist')

        render(<Create auth={auth} techs={techs} projectIdeas={[buildIdea()]} />)

        expect(setDataSpy).not.toHaveBeenCalled()
    })
})
