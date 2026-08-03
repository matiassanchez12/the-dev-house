import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Transition } from '@headlessui/react'
import { Link, useForm } from '@inertiajs/react'
import { toast } from 'sonner'

interface Props {
    mustVerifyEmail: boolean
    status?: string
    name: string
    email: string
    emailVerifiedAt: string | null
    className?: string
}

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    name,
    email,
    emailVerifiedAt,
    className = '',
}: Props) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name,
        email,
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        patch(route('profile.update'), {
            onSuccess: () => toast.success('Perfil actualizado exitosamente'),
            onError: () => toast.error('Error al actualizar el perfil'),
        })
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle role="heading" aria-level={3}>
                    Información del Perfil
                </CardTitle>
                <CardDescription>
                    Actualizá la información de tu perfil y correo electrónico.
                </CardDescription>
            </CardHeader>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <CardContent className="flex flex-col gap-6">
                    <Field id="name" label="Nombre" error={errors.name}>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                        />
                    </Field>

                    <Field id="email" label="Correo electrónico" error={errors.email}>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </Field>

                    {mustVerifyEmail && emailVerifiedAt === null && (
                        <div className="flex flex-col gap-3 rounded-none border border-border/60 bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">
                                Tu correo electrónico no está verificado.
                            </p>

                            <p>
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
                                <div className="text-sm font-medium text-primary">
                                    Se envió un nuevo enlace de verificación a tu correo
                                    electrónico.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex-wrap gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Guardado.</p>
                    </Transition>
                </CardFooter>
            </form>
        </Card>
    )
}
