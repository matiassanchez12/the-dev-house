import { render, screen, within } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'
import type { NotificationSetting, PrivacySetting } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Edit from './edit'

const mockForms = vi.hoisted(() => ({
    capturePrivacyProps: vi.fn(),
    captureNotificationProps: vi.fn(),
}))

vi.mock('@/components/seo', () => ({
    default: () => null,
}))

vi.mock('@/layouts/app-layout', () => ({
    default: ({ header, children }: { header: ReactNode; children: ReactNode }) => (
        <div>
            <div>{header}</div>
            <div>{children}</div>
        </div>
    ),
}))

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: { techs: [] },
    }),
}))

vi.mock('./partials/update-profile-information-form', () => ({
    default: () => (
        <section aria-label="profile information section">Profile information section</section>
    ),
}))

vi.mock('./partials/update-password-form', () => ({
    default: () => <section aria-label="password section">Password section</section>,
}))

vi.mock('./partials/delete-user-form', () => ({
    default: () => <section aria-label="delete account section">Delete account section</section>,
}))

vi.mock('./partials/update-profile-complete-form', () => ({
    default: () => <section aria-label="complete profile form">Complete profile form</section>,
}))

vi.mock('./partials/update-privacy-form', () => ({
    default: (props: { phone: string | null; privacySetting: PrivacySetting }) => {
        mockForms.capturePrivacyProps(props)

        return <section aria-label="privacy form">Privacy form</section>
    },
}))

vi.mock('./partials/update-notification-settings-form', () => ({
    default: (props: { notificationSetting: NotificationSetting }) => {
        mockForms.captureNotificationProps(props)

        return <section aria-label="notifications form">Notifications form</section>
    },
}))

vi.mock('./partials/social-links-edit-form', () => ({
    default: () => <section aria-label="social links form">Social links form</section>,
}))

const privacySetting: PrivacySetting = {
    id: 1,
    user_id: 1,
    show_email: false,
    show_phone: false,
    is_discoverable: true,
    show_activity: true,
    email_notifications_enabled: false,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
}

const notificationSetting: NotificationSetting = {
    id: 1,
    user_id: 1,
    collaboration_emails: true,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
}

function renderEdit(overrides?: Partial<ComponentProps<typeof Edit>>) {
    return render(
        <Edit
            mustVerifyEmail={false}
            name="Ada"
            email="ada@example.com"
            emailVerifiedAt={null}
            userTechs={[]}
            phone={null}
            privacySetting={privacySetting}
            notificationSetting={notificationSetting}
            socialLinks={[]}
            {...overrides}
        />,
    )
}

function getSection(sectionTitle: string) {
    return screen.getByRole('region', { name: sectionTitle })
}

function getSectionFormNames(sectionTitle: string) {
    return within(getSection(sectionTitle))
        .getAllByRole('region')
        .map((region) => region.getAttribute('aria-label'))
}

describe('Edit', () => {
    const sectionTitles = [
        'Perfil público',
        'Cuenta y seguridad',
        'Privacidad y notificaciones',
        'Zona de peligro',
    ]

    beforeEach(() => {
        mockForms.capturePrivacyProps.mockClear()
        mockForms.captureNotificationProps.mockClear()
    })

    it('renders the approved profile edit sections in order and groups forms inside them', () => {
        const { container } = renderEdit()

        expect(container.querySelector('div.mx-auto.max-w-4xl')).toBeInTheDocument()

        expect(
            screen
                .getAllByRole('heading', { level: 2 })
                .map((heading) => heading.textContent)
                .filter((title): title is string => sectionTitles.includes(title ?? '')),
        ).toEqual(sectionTitles)

        expect(getSectionFormNames('Perfil público')).toEqual([
            'profile information section',
            'complete profile form',
            'social links form',
        ])
        expect(getSectionFormNames('Cuenta y seguridad')).toEqual(['password section'])
        expect(getSectionFormNames('Privacidad y notificaciones')).toEqual([
            'privacy form',
            'notifications form',
        ])
        expect(getSectionFormNames('Zona de peligro')).toEqual(['delete account section'])
    })

    it('forwards privacy and notification props to their deferred forms', () => {
        renderEdit()

        expect(mockForms.capturePrivacyProps).toHaveBeenCalledOnce()
        expect(mockForms.capturePrivacyProps).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: null,
                privacySetting: expect.objectContaining({
                    is_discoverable: true,
                    show_activity: true,
                }),
            }),
        )
        expect(mockForms.captureNotificationProps).toHaveBeenCalledOnce()
        expect(mockForms.captureNotificationProps).toHaveBeenCalledWith(
            expect.objectContaining({
                notificationSetting: expect.objectContaining({
                    collaboration_emails: true,
                }),
            }),
        )
    })

    it('omits the social links wrapper when socialLinks is undefined', () => {
        render(
            <Edit
                mustVerifyEmail={false}
                name="Ada"
                email="ada@example.com"
                emailVerifiedAt={null}
                userTechs={[]}
                phone={null}
                privacySetting={privacySetting}
                notificationSetting={notificationSetting}
            />,
        )

        expect(getSectionFormNames('Perfil público')).toEqual([
            'profile information section',
            'complete profile form',
        ])
        expect(getSectionFormNames('Cuenta y seguridad')).toEqual(['password section'])
        expect(getSectionFormNames('Privacidad y notificaciones')).toEqual([
            'privacy form',
            'notifications form',
        ])
        expect(getSectionFormNames('Zona de peligro')).toEqual(['delete account section'])
    })
})
