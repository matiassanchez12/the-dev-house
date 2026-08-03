import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProfileTechFormEntry } from './profile-tech-form'
import UpdateProfileCompleteForm from './update-profile-complete-form'

interface MockFormData {
    bio: string
    avatar: File | null
    techs: ProfileTechFormEntry[]
}

const mockState = vi.hoisted(() => ({
    formData: null as MockFormData | null,
    errors: { bio: 'La biografía es obligatoria' } as Record<string, string>,
    recentlySuccessful: false,
    useForm: vi.fn(),
    post: vi.fn(),
    transform: vi.fn(),
    submittedData: null as unknown,
    props: {
        auth: {
            user: {
                id: 1,
                name: 'Ada Lovelace',
                avatar: null,
                bio: '',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
        },
    },
}))

vi.mock('@inertiajs/react', async () => {
    const React = await import('react')

    return {
        usePage: () => ({ props: mockState.props }),
        useForm: <T extends MockFormData>(initialData: T) => {
            mockState.useForm(initialData)
            const transformRef = React.useRef<(value: T) => unknown>((value) => value)
            const formDataRef = React.useRef<T>(initialData)

            const [data, setFormData] = React.useState<T>(() => {
                mockState.formData = initialData
                formDataRef.current = initialData

                return initialData
            })

            return {
                data,
                setData: <K extends keyof T>(field: K, value: T[K]) => {
                    setFormData((currentData) => {
                        const nextData = {
                            ...currentData,
                            [field]: value,
                        }

                        mockState.formData = nextData
                        formDataRef.current = nextData

                        return nextData
                    })
                },
                post: (url: string, options: unknown) => {
                    mockState.submittedData = transformRef.current(formDataRef.current)
                    mockState.post(url, options)
                },
                processing: false,
                errors: mockState.errors,
                recentlySuccessful: mockState.recentlySuccessful,
                transform: (callback: (value: T) => unknown) => {
                    mockState.transform(callback)
                    transformRef.current = callback
                },
            }
        },
    }
})

vi.mock('@/components/projects/project-utils', () => ({
    avatarUrl: () => null,
}))

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarFallback: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AvatarImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
    mockState.props.auth.user = buildAuthUser()
    mockState.formData = null
    mockState.errors = { bio: 'La biografía es obligatoria' }
    mockState.recentlySuccessful = false
    mockState.submittedData = null
    mockState.useForm.mockClear()
    mockState.post.mockClear()
    mockState.transform.mockClear()

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/profile/complete'),
    })

    Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: MouseEvent,
    })
})

describe('UpdateProfileCompleteForm', () => {
    it('maps initial form data from user.bio and userTechs', () => {
        mockState.props.auth.user = buildAuthUser({ bio: 'Construyo productos para developers' })

        const { container } = render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                    {
                        id: 2,
                        name: 'Laravel',
                        category: 'backend',
                        years: null,
                        proficiency: null,
                    },
                ])}
                allTechs={[
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 2, name: 'Laravel', category: 'backend' }),
                ]}
            />,
        )

        const submitButton = screen.getByRole('button', { name: 'Guardar Cambios' })
        const primaryCard = screen.getByTestId('profile-complete-card')
        const cardContent = screen.getByTestId('profile-complete-content')
        const cardFooter = screen.getByTestId('profile-complete-footer')
        const contentChildren = Array.from(cardContent?.children ?? [])

        expect(contentChildren.filter((element) => element.tagName === 'SECTION')).toHaveLength(3)
        expect(
            contentChildren.filter((element) => element.getAttribute('data-slot') === 'separator'),
        ).toHaveLength(2)

        expect(primaryCard).toContainElement(screen.getByRole('heading', { level: 3, name: 'Biografía' }))
        expect(primaryCard).toContainElement(
            screen.getByRole('heading', { level: 3, name: 'Foto de Perfil' }),
        )
        expect(primaryCard).toContainElement(
            screen.getByRole('heading', { level: 3, name: 'Stack Tecnológico' }),
        )
        expect(cardFooter).toContainElement(submitButton)

        const bio = screen.getByLabelText('Biografía')
        const reactSlider = screen.getByRole('slider', { name: /nivel de experiencia en react/i })
        const laravelYears = screen.getByRole('spinbutton', {
            name: 'Años de experiencia en Laravel',
        })
        const laravelSlider = screen.getByRole('slider', {
            name: 'Nivel de experiencia en Laravel',
        })

        expect(mockState.useForm).toHaveBeenCalledWith({
            bio: 'Construyo productos para developers',
            avatar: null,
            techs: [
                { id: 1, years_experience: 3, proficiency: 'advanced' },
                { id: 2, years_experience: 0, proficiency: 'intermediate' },
            ],
        })

        expect(screen.getByRole('heading', { level: 3, name: 'Biografía' })).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { level: 3, name: 'Foto de Perfil' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { level: 3, name: 'Stack Tecnológico' }),
        ).toBeInTheDocument()
        expect(screen.getByText('JPG, PNG o GIF. Máximo 2MB.')).toBeInTheDocument()
        expect(
            screen.getByText('Seleccioná las tecnologías que conocés y tu nivel de experiencia'),
        ).toBeInTheDocument()
        expect(bio).toHaveValue('Construyo productos para developers')
        expect(bio).toHaveAttribute('aria-invalid', 'true')
        expect(bio).toHaveAttribute('aria-describedby', 'bio-error')
        expect(screen.getByRole('alert')).toHaveTextContent('La biografía es obligatoria')

        expect(screen.getByRole('button', { name: /frontend/i })).toHaveAttribute(
            'aria-expanded',
            'true',
        )
        expect(screen.getByRole('button', { name: /backend/i })).toHaveAttribute(
            'aria-expanded',
            'true',
        )
        expect(screen.getByRole('button', { name: 'Quitar React' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Quitar Laravel' })).toBeInTheDocument()
        expect(reactSlider).toHaveValue('3')
        expect(laravelYears).toHaveValue(0)
        expect(laravelSlider).toHaveValue('2')
    })

    it('preserves the previous selected summary order and category ordering', () => {
        mockState.errors = {}

        render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 3,
                        name: 'Laravel',
                        category: 'backend',
                        years: 5,
                        proficiency: 'expert',
                    },
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                ])}
                allTechs={[
                    buildTech({ id: 2, name: 'Alpine', category: 'frontend' }),
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 3, name: 'Laravel', category: 'backend' }),
                ]}
            />,
        )

        expect(
            screen
                .getAllByRole('button', { name: /^Quitar /i })
                .map((button) => button.getAttribute('aria-label')),
        ).toEqual(['Quitar Laravel', 'Quitar React'])

        const alpineCheckbox = screen.getByRole('checkbox', { name: 'Alpine' })
        const reactCheckbox = screen.getByRole('checkbox', { name: 'React' })

        expect(
            alpineCheckbox.compareDocumentPosition(reactCheckbox) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    })

    it('lets the user open a collapsed category and reaches its tech options while surfacing tech errors', async () => {
        const user = userEvent.setup()

        mockState.errors = { techs: 'Seleccioná al menos una tecnología' }

        render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                ])}
                allTechs={[
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 2, name: 'Laravel', category: 'backend' }),
                ]}
            />,
        )

        const backendCategory = screen.getByRole('button', { name: /backend/i })

        expect(backendCategory).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('checkbox', { name: 'Laravel' })).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Seleccioná al menos una tecnología')

        await user.click(backendCategory)

        expect(backendCategory).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('checkbox', { name: 'Laravel' })).toBeInTheDocument()
    })

    it('removes a selected tech from the existing payload order', async () => {
        const user = userEvent.setup()

        mockState.errors = {}

        render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                    { id: 2, name: 'Vue', category: 'frontend', years: 4, proficiency: 'expert' },
                ])}
                allTechs={[
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 2, name: 'Vue', category: 'frontend' }),
                ]}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Quitar React' }))

        expect(screen.queryByRole('button', { name: 'Quitar React' })).not.toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: 'React' })).not.toBeChecked()

        await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }))

        expect(mockState.submittedData).toEqual({
            bio: '',
            avatar: null,
            techs: JSON.stringify([{ id: 2, years_experience: 4, proficiency: 'expert' }]),
        })
    })

    it('lets the user select a new tech, edit its details, and submits the serialized payload', async () => {
        const user = userEvent.setup()

        mockState.props.auth.user = buildAuthUser({ bio: 'Backend + frontend dev' })
        mockState.errors = {}

        render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                ])}
                allTechs={[
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 2, name: 'Vue', category: 'frontend' }),
                ]}
            />,
        )

        await user.click(screen.getByRole('checkbox', { name: 'Vue' }))

        const yearsInput = screen.getByRole('spinbutton', { name: 'Años de experiencia en Vue' })
        const proficiencySlider = screen.getByRole('slider', {
            name: 'Nivel de experiencia en Vue',
        })

        expect(yearsInput).toHaveValue(0)
        expect(proficiencySlider).toHaveValue('2')

        await user.clear(yearsInput)
        await user.type(yearsInput, '6')
        fireEvent.change(proficiencySlider, { target: { value: '4' } })

        expect(yearsInput).toHaveValue(6)
        expect(proficiencySlider).toHaveValue('4')

        await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }))

        expect(mockState.submittedData).toEqual({
            bio: 'Backend + frontend dev',
            avatar: null,
            techs: JSON.stringify([
                { id: 1, years_experience: 3, proficiency: 'advanced' },
                { id: 2, years_experience: 6, proficiency: 'expert' },
            ]),
        })
    })

    it('serializes the tech payload before submitting the complete profile form', async () => {
        const user = userEvent.setup()

        mockState.props.auth.user = buildAuthUser({ bio: 'Backend + frontend dev' })
        mockState.errors = {}

        render(
            <UpdateProfileCompleteForm
                userTechs={buildUserTechs([
                    {
                        id: 1,
                        name: 'React',
                        category: 'frontend',
                        years: 3,
                        proficiency: 'advanced',
                    },
                    {
                        id: 3,
                        name: 'Laravel',
                        category: 'backend',
                        years: 5,
                        proficiency: 'expert',
                    },
                ])}
                allTechs={[
                    buildTech({ id: 1, name: 'React', category: 'frontend' }),
                    buildTech({ id: 3, name: 'Laravel', category: 'backend' }),
                ]}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }))

        expect(globalThis.route).toHaveBeenCalledWith('profile.update-complete')
        expect(mockState.transform).toHaveBeenCalledTimes(1)
        expect(mockState.post).toHaveBeenCalledWith(
            '/profile/complete',
            expect.objectContaining({
                forceFormData: true,
                preserveScroll: true,
            }),
        )
        expect(mockState.submittedData).toEqual({
            bio: 'Backend + frontend dev',
            avatar: null,
            techs: JSON.stringify([
                { id: 1, years_experience: 3, proficiency: 'advanced' },
                { id: 3, years_experience: 5, proficiency: 'expert' },
            ]),
        })
    })

    it('shows the inline success feedback when the form was saved recently', () => {
        mockState.errors = {}
        mockState.recentlySuccessful = true

        render(
            <UpdateProfileCompleteForm
                userTechs={[]}
                allTechs={[buildTech({ id: 1, name: 'React', category: 'frontend' })]}
            />,
        )

        expect(screen.getByText('Guardado.')).toBeInTheDocument()
    })
})

function buildTech({
    id,
    name,
    category,
}: {
    id: number
    name: string
    category: 'frontend' | 'backend'
}) {
    return {
        id,
        name,
        slug: name.toLowerCase(),
        category,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    }
}

function buildAuthUser(overrides: Partial<typeof mockState.props.auth.user> = {}) {
    return {
        id: 1,
        name: 'Ada Lovelace',
        avatar: null,
        bio: '',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

function buildUserTechs(
    techs: Array<{
        id: number
        name: string
        category: 'frontend' | 'backend'
        years: number | null
        proficiency: 'advanced' | 'expert' | null
    }>,
) {
    return techs.map((tech) => ({
        ...buildTech({ id: tech.id, name: tech.name, category: tech.category }),
        pivot: {
            years_experience: tech.years,
            proficiency: tech.proficiency,
        },
    }))
}
