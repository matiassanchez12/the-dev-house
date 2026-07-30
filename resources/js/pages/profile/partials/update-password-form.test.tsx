import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UpdatePasswordForm from './update-password-form';

interface MockFormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

const mockState = vi.hoisted(() => ({
    data: {
        current_password: '',
        password: '',
        password_confirmation: '',
    } as MockFormData,
    errors: {} as Record<string, string>,
    recentlySuccessful: false,
    put: vi.fn(),
    reset: vi.fn(),
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
        errors: mockState.errors,
        put: mockState.put,
        reset: mockState.reset,
        processing: false,
        recentlySuccessful: mockState.recentlySuccessful,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

beforeEach(() => {
    mockState.data = {
        current_password: '',
        password: '',
        password_confirmation: '',
    };
    mockState.errors = {};
    mockState.recentlySuccessful = false;
    mockState.put.mockClear();
    mockState.reset.mockClear();
    mockState.setData.mockClear();

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/password'),
    });
});

describe('UpdatePasswordForm', () => {
    it('renders the password section copy, fields, and submit action', () => {
        render(<UpdatePasswordForm />);

        expect(screen.getByText('Actualizar Contraseña')).toBeInTheDocument();
        expect(screen.getByText('Asegurate de que tu cuenta use una contraseña larga y aleatoria para mantenerte seguro.')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña Actual')).toBeInTheDocument();
        expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    });

    it('resets password fields and focuses the password input on password errors', async () => {
        const user = userEvent.setup();

        render(<UpdatePasswordForm />);

        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        const [, options] = mockState.put.mock.calls[0] as [string, { onError: (errors: Record<string, string>) => void }];
        const passwordInput = screen.getByLabelText('Nueva Contraseña');
        const focusSpy = vi.spyOn(passwordInput, 'focus');

        options.onError({ password: 'La contraseña no cumple los requisitos' });

        expect(globalThis.route).toHaveBeenCalledWith('password.update');
        expect(mockState.reset).toHaveBeenCalledWith('password', 'password_confirmation');
        expect(focusSpy).toHaveBeenCalled();
    });

    it('focuses the current password input on current password errors', async () => {
        const user = userEvent.setup();

        render(<UpdatePasswordForm />);

        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        const [, options] = mockState.put.mock.calls[0] as [string, { onError: (errors: Record<string, string>) => void }];
        const currentPasswordInput = screen.getByLabelText('Contraseña Actual');
        const focusSpy = vi.spyOn(currentPasswordInput, 'focus');

        options.onError({ current_password: 'La contraseña actual es incorrecta' });

        expect(mockState.reset).toHaveBeenCalledWith('current_password');
        expect(focusSpy).toHaveBeenCalled();
    });
});
