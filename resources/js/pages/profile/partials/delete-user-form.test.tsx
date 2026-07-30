import { render, screen, waitFor } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteUserForm from './delete-user-form';

const mockState = vi.hoisted(() => ({
    data: {
        password: '',
    },
    errors: {} as Record<string, string>,
    destroy: vi.fn(),
    reset: vi.fn(),
    clearErrors: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        data: mockState.data,
        setData: vi.fn(),
        delete: mockState.destroy,
        processing: false,
        reset: mockState.reset,
        errors: mockState.errors,
        clearErrors: mockState.clearErrors,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

beforeEach(() => {
    mockState.data = { password: '' };
    mockState.errors = {};
    mockState.destroy.mockClear();
    mockState.reset.mockClear();
    mockState.clearErrors.mockClear();

    Object.defineProperty(globalThis, 'route', {
        configurable: true,
        value: vi.fn().mockReturnValue('/profile'),
    });
});

describe('DeleteUserForm', () => {
    it('renders the account deletion section and exposes an accessible dialog title', async () => {
        const user = userEvent.setup();

        render(<DeleteUserForm />);

        expect(screen.getByText('Una vez eliminada tu cuenta, todos sus recursos y datos se eliminarán permanentemente. Antes de eliminar tu cuenta, descargá cualquier dato o información que quieras conservar.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Eliminar Cuenta' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Eliminar Cuenta' }));

        const dialog = await screen.findByRole('dialog', { name: /¿estás seguro de que querés eliminar tu cuenta\?/i });

        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveTextContent(/Ingresá tu contraseña para confirmar que querés eliminar permanentemente tu cuenta\./i);

        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog', { name: /¿estás seguro/i })).not.toBeInTheDocument();
    });

    it('runs modal cleanup when the dialog is dismissed from the built-in close control', async () => {
        const user = userEvent.setup();

        render(<DeleteUserForm />);

        await user.click(screen.getByRole('button', { name: 'Eliminar Cuenta' }));

        const dialog = await screen.findByRole('dialog', { name: /¿estás seguro de que querés eliminar tu cuenta\?/i });

        await user.click(within(dialog).getByRole('button', { name: 'Close' }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /¿estás seguro/i })).not.toBeInTheDocument();
        });

        expect(mockState.clearErrors).toHaveBeenCalledTimes(1);
        expect(mockState.reset).toHaveBeenCalledTimes(1);
    });

    it('submits the delete request and executes its success, error, and finish callbacks', async () => {
        const user = userEvent.setup();

        render(<DeleteUserForm />);

        await user.click(screen.getByRole('button', { name: 'Eliminar Cuenta' }));
        const dialog = await screen.findByRole('dialog', { name: /¿estás seguro de que querés eliminar tu cuenta\?/i });
        await user.type(within(dialog).getByLabelText('Contraseña'), 'secret123');
        await user.click(within(dialog).getByRole('button', { name: 'Eliminar Cuenta' }));

        expect(globalThis.route).toHaveBeenCalledWith('profile.destroy');
        expect(mockState.destroy).toHaveBeenCalledWith('/profile', expect.objectContaining({
            preserveScroll: true,
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
            onFinish: expect.any(Function),
        }));
        const [, options] = mockState.destroy.mock.calls[0] as [
            string,
            { onSuccess: () => void; onError: () => void; onFinish: () => void },
        ];
        const focusSpy = vi.spyOn(within(dialog).getByLabelText('Contraseña'), 'focus');

        options.onError();

        expect(toast.error).toHaveBeenCalledWith('Error al eliminar la cuenta. Verificá tu contraseña.');
        expect(focusSpy).toHaveBeenCalled();

        options.onSuccess();

        expect(mockState.clearErrors).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /¿estás seguro/i })).not.toBeInTheDocument();
        });

        options.onFinish();

        expect(mockState.reset).toHaveBeenCalled();
    });
});
