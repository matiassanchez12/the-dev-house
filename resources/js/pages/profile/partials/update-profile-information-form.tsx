import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transition } from '@headlessui/react';
import { Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    name: string;
    email: string;
    emailVerifiedAt: string | null;
    className?: string;
}

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    name,
    email,
    emailVerifiedAt,
    className = '',
}: Props) {
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: name,
            email: email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            onSuccess: () => toast.success('Perfil actualizado exitosamente'),
            onError: () => toast.error('Error al actualizar el perfil'),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-foreground">
                    Información del Perfil
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Actualizá la información de tu perfil y correo electrónico.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <Field id="name" label="Nombre" error={errors.name}>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                    />
                </Field>

                <Field id="email" label="Correo electrónico" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                </Field>

                {mustVerifyEmail && emailVerifiedAt === null && (
                    <div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Tu correo electrónico no está verificado.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                Hacé clic aquí para reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-primary">
                                Se envió un nuevo enlace de verificación a tu correo electrónico.
                            </div>
                        )}
                    </div>
                )}

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