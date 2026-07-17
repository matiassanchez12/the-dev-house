import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationSetting } from '@/types';
import UpdateNotificationSettingsForm from './update-notification-settings-form';

interface MockFormData {
    collaboration_emails: boolean;
}

const mockState = vi.hoisted(() => ({
    formData: {
        collaboration_emails: true,
    } as MockFormData,
    errors: {},
    recentlySuccessful: false,
    post: vi.fn(),
    setData: vi.fn(<K extends keyof MockFormData>(field: K, value: MockFormData[K]) => {
        mockState.formData = {
            ...mockState.formData,
            [field]: value,
        };
    }),
}));

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockState.formData,
        setData: mockState.setData,
        post: mockState.post,
        processing: false,
        errors: mockState.errors,
        recentlySuccessful: mockState.recentlySuccessful,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
}));

beforeEach(() => {
    mockState.formData = {
        collaboration_emails: true,
    };
    mockState.errors = {};
    mockState.recentlySuccessful = false;
    mockState.post.mockClear();
    mockState.setData.mockClear();

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/profile/notifications'),
    });
});

describe('UpdateNotificationSettingsForm', () => {
    it('renders the current collaboration email preference', () => {
        render(<UpdateNotificationSettingsForm notificationSetting={buildNotificationSetting()} />);

        expect(screen.getByRole('heading', { name: 'Notificaciones opcionales' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /Recibir emails opcionales de colaboración/i })).toBeChecked();
    });

    it('submits the collaboration email preference change', async () => {
        const user = userEvent.setup();

        render(<UpdateNotificationSettingsForm notificationSetting={buildNotificationSetting()} />);

        await user.click(screen.getByRole('checkbox', { name: /Recibir emails opcionales de colaboración/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(mockState.setData).toHaveBeenCalledWith('collaboration_emails', false);
        expect(globalThis.route).toHaveBeenCalledWith('profile.notifications.update');
        expect(mockState.post).toHaveBeenCalledWith('/profile/notifications', expect.objectContaining({
            preserveScroll: true,
        }));
    });
});

function buildNotificationSetting(overrides: Partial<NotificationSetting> = {}): NotificationSetting {
    return {
        id: 1,
        user_id: 1,
        collaboration_emails: true,
        created_at: '2026-07-07T00:00:00.000Z',
        updated_at: '2026-07-07T00:00:00.000Z',
        ...overrides,
    };
}
