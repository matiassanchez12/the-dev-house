import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    className?: string;
}

export default function DeleteUserForm({ className = '' }: Props) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

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

    const deleteUser = (e: React.FormEvent) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => {
                toast.error('Error al eliminar la cuenta. Verificá tu contraseña.');
                passwordInput.current?.focus();
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
        <Card className={className}>
            <CardHeader>
                <CardTitle>Eliminar Cuenta</CardTitle>
                <CardDescription>
                    Una vez eliminada tu cuenta, todos sus recursos y datos se
                    eliminarán permanentemente. Antes de eliminar tu cuenta,
                    descargá cualquier dato o información que quieras conservar.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Button variant="destructive" onClick={confirmUserDeletion}>
                    Eliminar Cuenta
                </Button>
            </CardContent>

            <Dialog
                open={confirmingUserDeletion}
                onOpenChange={(open) => {
                    if (open) {
                        setConfirmingUserDeletion(true);

                        return;
                    }

                    closeModal();
                }}
            >
                <DialogContent>
                    <form onSubmit={deleteUser} className="flex flex-col gap-6 p-2">
                        <DialogHeader>
                            <DialogTitle>
                                ¿Estás seguro de que querés eliminar tu cuenta?
                            </DialogTitle>

                            <DialogDescription>
                                Una vez eliminada tu cuenta, todos sus recursos y
                                datos se eliminarán permanentemente. Ingresá tu
                                contraseña para confirmar que querés eliminar
                                permanentemente tu cuenta.
                            </DialogDescription>
                        </DialogHeader>

                        <CardContent className="px-0">
                            <Field id="password" label="Contraseña" labelClassName="sr-only" error={errors.password}>
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
                                    autoFocus
                                    placeholder="Contraseña"
                                />
                            </Field>
                        </CardContent>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={closeModal}>
                                Cancelar
                            </Button>

                            <Button type="submit" variant="destructive" disabled={processing}>
                                Eliminar Cuenta
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
