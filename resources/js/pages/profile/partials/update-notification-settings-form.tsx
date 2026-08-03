import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormError } from '@/components/ui/form-error'
import { useForm } from '@inertiajs/react'
import { Transition } from '@headlessui/react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import type { NotificationSetting } from '@/types'

interface Props {
    notificationSetting: NotificationSetting
    className?: string
}

interface NotificationFormData {
    collaboration_emails: boolean
}

export default function UpdateNotificationSettingsForm({
    notificationSetting,
    className = '',
}: Props) {
    const collaborationEmailsErrorId = 'notification-collaboration-emails-error'

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm<NotificationFormData>({
            collaboration_emails: notificationSetting.collaboration_emails,
        })

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        post(route('profile.notifications.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Notificaciones actualizadas'),
            onError: () => toast.error('Error al actualizar las notificaciones'),
        })
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle role="heading" aria-level={3}>
                    Notificaciones opcionales
                </CardTitle>
                <CardDescription>
                    Definí si querés recibir correos opcionales de colaboración como invitaciones y
                    actualizaciones de solicitudes.
                </CardDescription>
            </CardHeader>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-start gap-3 rounded-none border border-border/60 p-4">
                            <Checkbox
                                checked={data.collaboration_emails}
                                onCheckedChange={(checked) =>
                                    setData('collaboration_emails', checked === true)
                                }
                                aria-describedby={
                                    errors.collaboration_emails
                                        ? collaborationEmailsErrorId
                                        : undefined
                                }
                                aria-invalid={errors.collaboration_emails ? true : undefined}
                            />
                            <span className="flex flex-col gap-1">
                                <span className="block text-sm font-medium text-foreground">
                                    Recibir emails opcionales de colaboración
                                </span>
                                <span className="block text-sm text-muted-foreground">
                                    Controla solo correos opcionales de colaboración; los emails de
                                    seguridad y acceso siguen llegando siempre.
                                </span>
                            </span>
                        </label>
                        <FormError
                            id={collaborationEmailsErrorId}
                            message={errors.collaboration_emails}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex-wrap gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar cambios
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
