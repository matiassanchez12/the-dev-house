import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UpdateProfileInformationForm from './update-profile-information-form';

interface MockFormData {
    name: string;
    email: string;
}

const mockState = vi.hoisted(() => ({
    data: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
    } as MockFormData,
    errors: {} as Record<string, string>,
    recentlySuccessful: false,
    patch: vi.fn(),
    setData: vi.fn(<K extends keyof MockFormData>(field: K, value: MockFormData[K]) => {
        mockState.data = {
            ...mockState.data,
            [field]: value,
        };
    }),
}));

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockState.data,
        setData: mockState.setData,
        patch: mockState.patch,
        errors: mockState.errors,
        processing: false,
        recentlySuccessful: mockState.recentlySuccessful,
    }),
    Link: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

beforeEach(() => {
    mockState.data = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
    };
    mockState.errors = {};
    mockState.recentlySuccessful = false;
    mockState.patch.mockClear();
    mockState.setData.mockClear();

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/profile'),
    });
});

describe('UpdateProfileInformationForm', () => {
    it('renders the profile fields and verification resend copy', () => {
        render(
            <UpdateProfileInformationForm
                mustVerifyEmail
                status="verification-link-sent"
                name="Ada Lovelace"
                email="ada@example.com"
                emailVerifiedAt={null}
            />,
        );

        expect(screen.getByText('Información del Perfil')).toBeInTheDocument();
        expect(screen.getByText('Se envió un nuevo enlace de verificación a tu correo electrónico.')).toBeInTheDocument();
        expect(screen.getAllByText('Actualizá la información de tu perfil y correo electrónico.')).toHaveLength(1);
        expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    });

    it('submits the profile update route and wires success and error callbacks', async () => {
        const user = userEvent.setup();

        render(
            <UpdateProfileInformationForm
                mustVerifyEmail={false}
                name="Ada Lovelace"
                email="ada@example.com"
                emailVerifiedAt="2026-07-01T00:00:00Z"
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(globalThis.route).toHaveBeenCalledWith('profile.update');
        expect(mockState.patch).toHaveBeenCalledWith('/profile', expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        }));
        const [, options] = mockState.patch.mock.calls[0] as [
            string,
            { onSuccess: () => void; onError: () => void },
        ];

        options.onSuccess();
        options.onError();

        expect(toast.success).toHaveBeenCalledWith('Perfil actualizado exitosamente');
        expect(toast.error).toHaveBeenCalledWith('Error al actualizar el perfil');
    });

    it('renders saved feedback when the form was recently successful', () => {
        mockState.recentlySuccessful = true;

        render(
            <UpdateProfileInformationForm
                mustVerifyEmail={false}
                name="Ada Lovelace"
                email="ada@example.com"
                emailVerifiedAt="2026-07-01T00:00:00Z"
            />,
        );

        expect(screen.getByText('Guardado.')).toBeInTheDocument();
    });
});
