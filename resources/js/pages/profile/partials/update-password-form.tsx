import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Transition } from '@headlessui/react'
import { useForm } from '@inertiajs/react'
import { type FormEvent, useRef } from 'react'
import { toast } from 'sonner'

interface Props {
    className?: string
}

export default function UpdatePasswordForm({ className = '' }: Props) {
    const passwordInput = useRef<HTMLInputElement>(null)
    const currentPasswordInput = useRef<HTMLInputElement>(null)

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
    })

    const updatePassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                toast.error('Error al actualizar la contraseña')

                if (errors.password) {
                    reset('password', 'password_confirmation')
                    passwordInput.current?.focus()
                }

                if (errors.current_password) {
                    reset('current_password')
                    currentPasswordInput.current?.focus()
                }
            },
        })
    }

    return (
        <Card size="sm" className={className}>
            <CardHeader>
                <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                    Actualizar Contraseña
                </h3>
                <CardDescription>
                    Asegurate de que tu cuenta use una contraseña larga y aleatoria para mantenerte seguro.
                </CardDescription>
            </CardHeader>

            <form onSubmit={updatePassword} className="flex flex-col gap-6">
                <CardContent className="flex flex-col gap-5">
                    <Field id="current_password" label="Contraseña Actual" error={errors.current_password}>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            className="w-full"
                            autoComplete="current-password"
                        />
                    </Field>

                    <Separator />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="password" label="Nueva Contraseña" error={errors.password}>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="w-full"
                                autoComplete="new-password"
                            />
                        </Field>

                        <Field
                            id="password_confirmation"
                            label="Confirmar Contraseña"
                            error={errors.password_confirmation}
                        >
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="w-full"
                                autoComplete="new-password"
                            />
                        </Field>
                    </div>
                </CardContent>

                <CardFooter className="flex-wrap justify-between gap-4">
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
