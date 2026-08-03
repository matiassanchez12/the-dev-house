import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useForm } from '@inertiajs/react'
import { type FormEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

interface Props {
    className?: string
}

export default function DeleteUserForm({ className = '' }: Props) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false)
    const passwordInput = useRef<HTMLInputElement>(null)

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
    })

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true)
    }

    const deleteUser = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => {
                toast.error('Error al eliminar la cuenta. Verificá tu contraseña.')
                passwordInput.current?.focus()
            },
            onFinish: () => reset(),
        })
    }

    const closeModal = () => {
        setConfirmingUserDeletion(false)

        clearErrors()
        reset()
    }

    return (
        <Card size="sm" className={className}>
            <CardHeader>
                <CardTitle role="heading" aria-level={3}>
                    Eliminar Cuenta
                </CardTitle>
                <CardDescription>
                    Una vez eliminada tu cuenta, todos sus recursos y datos se
                    eliminarán permanentemente. Antes de eliminar tu cuenta,
                    descargá cualquier dato o información que quieras conservar.
                </CardDescription>
            </CardHeader>

            <CardFooter className="justify-start">
                <Button type="button" variant="destructive" onClick={confirmUserDeletion}>
                    Eliminar Cuenta
                </Button>
            </CardFooter>

            <Dialog
                open={confirmingUserDeletion}
                onOpenChange={(open) => {
                    if (open) {
                        setConfirmingUserDeletion(true)

                        return
                    }

                    closeModal()
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={deleteUser} className="flex flex-col gap-6">
                        <DialogHeader className="gap-2">
                            <DialogTitle className="text-destructive">
                                ¿Estás seguro de que querés eliminar tu cuenta?
                            </DialogTitle>

                            <DialogDescription>
                                Una vez eliminada tu cuenta, todos sus recursos y
                                datos se eliminarán permanentemente. Ingresá tu
                                contraseña para confirmar que querés eliminar
                                permanentemente tu cuenta.
                            </DialogDescription>
                        </DialogHeader>

                        <Separator />

                        <Field
                            id="password"
                            label="Contraseña"
                            labelClassName="sr-only"
                            error={errors.password}
                            className="max-w-sm"
                        >
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full"
                                autoFocus
                                placeholder="Contraseña"
                            />
                        </Field>

                        <DialogFooter className="border-t pt-4">
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
    )
}
