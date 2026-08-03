import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SocialLinksEditForm from './social-links-edit-form'

interface MockFormLink {
    id?: number
    platform: string
    url: string
}

interface MockFormData {
    links: MockFormLink[]
}

const mockState = vi.hoisted(() => ({
    errors: {} as Record<string, string>,
    formData: null as MockFormData | null,
    recentlySuccessful: false,
    put: vi.fn(),
    routerDelete: vi.fn(),
    transform: vi.fn(),
    submittedData: null as MockFormData | null,
}))

vi.mock('@inertiajs/react', async () => {
    const React = await import('react')

    return {
        useForm: <T extends MockFormData>(initialData: T) => {
            const transformRef = React.useRef<(value: T) => T>((value) => value)
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
                put: (url: string, options: unknown) => {
                    mockState.submittedData = transformRef.current(formDataRef.current)
                    mockState.put(url, options)
                },
                processing: false,
                errors: mockState.errors,
                recentlySuccessful: mockState.recentlySuccessful,
                transform: (callback: (data: T) => T) => {
                    mockState.transform(callback)
                    transformRef.current = callback
                },
            }
        },
        router: {
            delete: mockState.routerDelete,
        },
    }
})

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

beforeEach(() => {
    mockState.errors = {}
    mockState.formData = null
    mockState.recentlySuccessful = false
    mockState.submittedData = null
    mockState.put.mockClear()
    mockState.routerDelete.mockClear()
    mockState.transform.mockClear()

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockImplementation((name: string, params?: { socialLink: number }) => {
            if (name === 'social-links.update') {
                return '/profile/social-links'
            }

            return `/profile/social-links/${params?.socialLink ?? 1}`
        }),
    })

    Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: MouseEvent,
    })

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: vi.fn(),
    })

    Object.defineProperty(window.HTMLElement.prototype, 'hasPointerCapture', {
        configurable: true,
        value: vi.fn().mockReturnValue(false),
    })

    Object.defineProperty(window.HTMLElement.prototype, 'releasePointerCapture', {
        configurable: true,
        value: vi.fn(),
    })

    Object.defineProperty(window.Element.prototype, 'getAnimations', {
        configurable: true,
        value: vi.fn().mockReturnValue([]),
    })
})

describe('SocialLinksEditForm', () => {
    it('renders the social links card copy', () => {
        render(<SocialLinksEditForm socialLinks={[]} />)

        expect(
            screen.getByRole('heading', { level: 3, name: 'Links Sociales' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Agregar link' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeInTheDocument()
    })

    it('submits an empty links array when the form only contains the default blank row', async () => {
        const user = userEvent.setup()

        render(<SocialLinksEditForm socialLinks={[]} />)

        await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }))

        expect(globalThis.route).toHaveBeenCalledWith('social-links.update')
        expect(mockState.submittedData).toEqual({ links: [] })
        expect(mockState.put).toHaveBeenCalledWith(
            '/profile/social-links',
            expect.objectContaining({
                preserveScroll: true,
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            }),
        )
    })

    it('excludes partially completed rows while preserving completed rows during submit normalization', async () => {
        const user = userEvent.setup()

        render(
            <SocialLinksEditForm
                socialLinks={[
                    { id: 1, platform: 'github', url: 'https://github.com/ada' },
                    { id: 2, platform: 'linkedin', url: 'https://linkedin.com/in/ada' },
                ]}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Agregar link' }))

        const urlInputs = screen.getAllByLabelText('URL')

        await user.type(urlInputs[2], 'https://example.com/incomplete')
        await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }))

        expect(mockState.submittedData).toEqual({
            links: [
                { id: 1, platform: 'github', url: 'https://github.com/ada' },
                { id: 2, platform: 'linkedin', url: 'https://linkedin.com/in/ada' },
            ],
        })
    })

    it('wires row-level platform and url errors to their controls', () => {
        mockState.errors = {
            'links.0.platform': 'Seleccioná una plataforma',
            'links.0.url': 'Ingresá una URL válida',
        }

        render(
            <SocialLinksEditForm
                socialLinks={[{ id: 1, platform: 'github', url: 'https://github.com/ada' }]}
            />,
        )

        expect(screen.getByLabelText('Plataforma')).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByLabelText('Plataforma')).toHaveAttribute(
            'aria-describedby',
            'social-link-platform-0-error',
        )
        expect(screen.getByLabelText('URL')).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByLabelText('URL')).toHaveAttribute(
            'aria-describedby',
            'social-link-url-0-error',
        )
        expect(screen.getByText('Seleccioná una plataforma')).toHaveAttribute(
            'id',
            'social-link-platform-0-error',
        )
        expect(screen.getByText('Ingresá una URL válida')).toHaveAttribute(
            'id',
            'social-link-url-0-error',
        )
    })

    it('deletes a saved row through router.delete', async () => {
        const user = userEvent.setup()

        render(
            <SocialLinksEditForm
                socialLinks={[{ id: 7, platform: 'github', url: 'https://github.com/ada' }]}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Eliminar link' }))

        expect(globalThis.route).toHaveBeenCalledWith('social-links.destroy', { socialLink: 7 })
        expect(mockState.routerDelete).toHaveBeenCalledWith(
            '/profile/social-links/7',
            expect.objectContaining({
                preserveScroll: true,
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            }),
        )
    })

    it('removes an unsaved row locally without calling router.delete', async () => {
        const user = userEvent.setup()

        render(<SocialLinksEditForm socialLinks={[]} />)

        await user.click(screen.getByRole('button', { name: 'Agregar link' }))
        await user.click(screen.getAllByLabelText('Plataforma')[1])
        await user.click(await screen.findByRole('option', { name: 'GitHub' }))

        expect(screen.getAllByRole('button', { name: 'Eliminar link' })).toHaveLength(2)

        await user.click(screen.getAllByRole('button', { name: 'Eliminar link' })[1])

        expect(screen.getAllByRole('button', { name: 'Eliminar link' })).toHaveLength(1)
        expect(mockState.routerDelete).not.toHaveBeenCalled()
    })
})
