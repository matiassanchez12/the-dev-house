import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { PrivacySetting, SocialLink } from '@/types';
import Edit from './edit';

const mockState = vi.hoisted(() => ({
    techs: [{ id: 1, name: 'React', slug: 'react' }],
    privacyProps: undefined as undefined | { phone: string | null; privacySetting: PrivacySetting },
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ props: { techs: mockState.techs } }),
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('./partials/update-profile-information-form', () => ({
    default: () => <div data-testid="profile-card">Basic profile</div>,
}));

vi.mock('./partials/update-profile-complete-form', () => ({
    default: () => <div data-testid="profile-card">Complete profile</div>,
}));

vi.mock('./partials/update-privacy-form', () => ({
    default: (props: { phone: string | null; privacySetting: PrivacySetting }) => {
        mockState.privacyProps = props;

        return <div data-testid="profile-card">Privacy settings</div>;
    },
}));

vi.mock('./partials/social-links-edit-form', () => ({
    default: () => <div data-testid="profile-card">Social links</div>,
}));

vi.mock('./partials/update-password-form', () => ({
    default: () => <div data-testid="profile-card">Password</div>,
}));

vi.mock('./partials/delete-user-form', () => ({
    default: () => <div data-testid="profile-card">Delete account</div>,
}));

function buildPrivacySetting(overrides: Partial<PrivacySetting> = {}): PrivacySetting {
    return {
        id: 1,
        user_id: 1,
        show_email: true,
        email_notifications_enabled: true,
        show_phone: false,
        is_discoverable: true,
        show_activity: false,
        created_at: '2026-07-07T00:00:00.000Z',
        updated_at: '2026-07-07T00:00:00.000Z',
        ...overrides,
    };
}

describe('Profile edit page wiring', () => {
    it('renders the privacy card between the complete profile and social links cards', () => {
        const { container } = render(
            <Edit
                mustVerifyEmail={false}
                name="Ada"
                email="ada@example.com"
                emailVerifiedAt={null}
                userTechs={[]}
                socialLinks={[] as SocialLink[]}
                phone="555-1234"
                privacySetting={buildPrivacySetting()}
            />,
        );

        expect(Array.from(container.querySelectorAll('[data-testid="profile-card"]')).map((node) => node.textContent)).toEqual([
            'Basic profile',
            'Complete profile',
            'Privacy settings',
            'Social links',
            'Password',
            'Delete account',
        ]);
    });

    it('forwards the phone and privacySetting props to the privacy form', () => {
        render(
            <Edit
                mustVerifyEmail={false}
                name="Ada"
                email="ada@example.com"
                emailVerifiedAt={null}
                userTechs={[]}
                socialLinks={[] as SocialLink[]}
                phone={null}
                privacySetting={buildPrivacySetting({ show_phone: true })}
            />,
        );

        expect(mockState.privacyProps).toMatchObject({
            phone: null,
            privacySetting: expect.objectContaining({
                show_phone: true,
            }),
        });
    });
});
