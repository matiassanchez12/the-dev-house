import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { toast } from 'sonner';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Contraseña actualizada exitosamente');
            },
            onError: (errors) => {
                toast.error('Error al actualizar la contraseña');
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-foreground">
                    Actualizar Contraseña
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Asegurate de que tu cuenta use una contraseña larga y aleatoria para mantenerte seguro.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <Field id="current_password" label="Contraseña Actual" error={errors.current_password}>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                </Field>

                <Field id="password" label="Nueva Contraseña" error={errors.password}>
                    <Input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                </Field>

                <Field id="password_confirmation" label="Confirmar Contraseña" error={errors.password_confirmation}>
                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                </Field>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>Guardar</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">
                            Guardado.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}