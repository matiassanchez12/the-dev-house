import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import InputLabel from '@/components/input-label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => {
                toast.error('Error al eliminar la cuenta. Verificá tu contraseña.');
                passwordInput.current.focus();
            },
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-foreground">
                    Eliminar Cuenta
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Una vez eliminada tu cuenta, todos sus recursos y datos se
                    eliminarán permanentemente. Antes de eliminar tu cuenta,
                    descargá cualquier dato o información que quieras conservar.
                </p>
            </header>

            <Button variant="destructive" onClick={confirmUserDeletion}>
                Eliminar Cuenta
            </Button>

            <Dialog open={confirmingUserDeletion} onOpenChange={setConfirmingUserDeletion}>
                <DialogContent>
                    <form onSubmit={deleteUser} className="p-6">
                        <h2 className="text-lg font-medium text-foreground">
                            ¿Estás seguro de que querés eliminar tu cuenta?
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Una vez eliminada tu cuenta, todos sus recursos y
                            datos se eliminarán permanentemente. Ingresá tu
                            contraseña para confirmar que querés eliminar
                            permanentemente tu cuenta.
                        </p>

                        <div className="mt-6">
                            <InputLabel
                                htmlFor="password"
                                value="Contraseña"
                                className="sr-only"
                            />

                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1 block w-3/4"
                                isFocused
                                placeholder="Contraseña"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button variant="secondary" onClick={closeModal}>
                                Cancelar
                            </Button>

                            <Button type="submit" variant="destructive" className="ms-3" disabled={processing}>
                                Eliminar Cuenta
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}