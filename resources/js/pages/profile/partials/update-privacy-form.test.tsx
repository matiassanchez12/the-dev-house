import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrivacySetting } from '@/types';
import UpdatePrivacyForm from './update-privacy-form';

const mockState = vi.hoisted(() => ({
    formData: {
        phone: '555-1234',
        show_email: true,
        show_phone: false,
        is_discoverable: true,
        show_activity: false,
    },
    errors: {
        phone: 'El teléfono no es válido',
        show_phone: 'No se pudo guardar la visibilidad del teléfono',
    },
    recentlySuccessful: false,
    post: vi.fn(),
    setData: vi.fn((field: string, value: unknown) => {
        (mockState.formData as Record<string, unknown>)[field] = value;
    }),
    transform: vi.fn((callback: (data: typeof mockState.formData) => typeof mockState.formData) => {
        mockState.formData = callback({ ...mockState.formData });
        return mockState.formData;
    }),
    transformedData: null as null | typeof mockState.formData,
}));

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockState.formData,
        setData: mockState.setData,
        post: mockState.post,
        processing: false,
        errors: mockState.errors,
        recentlySuccessful: mockState.recentlySuccessful,
        transform: (callback: (data: typeof mockState.formData) => typeof mockState.formData) => {
            mockState.transformedData = callback({ ...mockState.formData });
            return mockState.transformedData;
        },
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

vi.mock('@headlessui/react', async () => {
    const actual = await vi.importActual<typeof import('@headlessui/react')>('@headlessui/react');

    return {
        ...actual,
    };
});

beforeEach(() => {
    mockState.formData = {
        phone: '555-1234',
        show_email: true,
        show_phone: false,
        is_discoverable: true,
        show_activity: false,
    };
    mockState.errors = {
        phone: 'El teléfono no es válido',
        show_phone: 'No se pudo guardar la visibilidad del teléfono',
    };
    mockState.recentlySuccessful = false;
    mockState.post.mockClear();
    mockState.setData.mockClear();
    mockState.transform.mockClear();
    mockState.transformedData = null;

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/profile/privacy'),
    });
});

describe('UpdatePrivacyForm', () => {
    it('renders the current phone and privacy state with helper copy', () => {
        render(<UpdatePrivacyForm phone="555-1234" privacySetting={buildPrivacySetting()} />);

        expect(screen.getByLabelText('Teléfono')).toHaveValue('555-1234');
        expect(screen.getByRole('checkbox', { name: /Mostrar correo electrónico/i })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: /Mostrar teléfono/i })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: /Ser descubrible en el directorio/i })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: /Mostrar actividad pública/i })).not.toBeChecked();

        expect(screen.getByText(/Cualquiera que visite tu perfil podrá ver tu correo/i)).toBeInTheDocument();
        expect(screen.getByText(/tu teléfono será visible/i)).toBeInTheDocument();
        expect(screen.getByText(/aparecer en el directorio/i)).toBeInTheDocument();
        expect(screen.getByText(/tu actividad pública podrá mostrarse/i)).toBeInTheDocument();
    });

    it('updates privacy toggles and normalizes a blank phone on submit', async () => {
        const user = userEvent.setup();

        render(<UpdatePrivacyForm phone="555-1234" privacySetting={buildPrivacySetting()} />);

        await user.click(screen.getByRole('checkbox', { name: /Mostrar teléfono/i }));
        await user.clear(screen.getByLabelText('Teléfono'));
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(mockState.setData).toHaveBeenCalledWith('show_phone', true);
        expect(mockState.setData).toHaveBeenCalledWith('phone', '');
        expect(mockState.transformedData).toMatchObject({
            phone: null,
            show_email: true,
            show_phone: true,
            is_discoverable: true,
            show_activity: false,
        });
        expect(globalThis.route).toHaveBeenCalledWith('profile.privacy.update');
        expect(mockState.post).toHaveBeenCalledWith('/profile/privacy', expect.objectContaining({
            preserveScroll: true,
        }));
    });

    it('allows entering a phone number when the current value is missing', async () => {
        mockState.formData = {
            phone: '',
            show_email: true,
            show_phone: false,
            is_discoverable: true,
            show_activity: false,
        };

        render(<UpdatePrivacyForm phone={null} privacySetting={buildPrivacySetting()} />);

        const phoneInput = screen.getByLabelText('Teléfono');

        expect(phoneInput).toHaveValue('');

        fireEvent.change(phoneInput, { target: { value: '+54 11 5555-5555' } });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(mockState.setData).toHaveBeenCalledWith('phone', '+54 11 5555-5555');
        expect(mockState.transformedData).toMatchObject({
            phone: '+54 11 5555-5555',
            show_email: true,
            show_phone: false,
            is_discoverable: true,
            show_activity: false,
        });
    });

    it('shows inline errors and success feedback', () => {
        mockState.recentlySuccessful = true;

        render(<UpdatePrivacyForm phone="555-1234" privacySetting={buildPrivacySetting()} />);

        expect(screen.getAllByRole('alert')[0]).toHaveTextContent('El teléfono no es válido');
        expect(screen.getAllByRole('alert')[1]).toHaveTextContent('No se pudo guardar la visibilidad del teléfono');
        expect(screen.getByText('Guardado.')).toBeInTheDocument();
    });
});

function buildPrivacySetting(overrides: Partial<PrivacySetting> = {}): PrivacySetting {
    return {
        id: 1,
        user_id: 1,
        show_email: true,
        show_phone: false,
        is_discoverable: true,
        show_activity: false,
        created_at: '2026-07-07T00:00:00.000Z',
        updated_at: '2026-07-07T00:00:00.000Z',
        ...overrides,
    };
}
