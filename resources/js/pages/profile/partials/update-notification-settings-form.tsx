import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/form-error';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { NotificationSetting } from '@/types';

interface Props {
    notificationSetting: NotificationSetting;
    className?: string;
}

interface NotificationFormData {
    collaboration_emails: boolean;
}

export default function UpdateNotificationSettingsForm({ notificationSetting, className = '' }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<NotificationFormData>({
        collaboration_emails: notificationSetting.collaboration_emails,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('profile.notifications.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Notificaciones actualizadas'),
            onError: () => toast.error('Error al actualizar las notificaciones'),
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-foreground">Notificaciones opcionales</h3>
                        <p className="text-sm text-muted-foreground">
                            Definí si querés recibir correos opcionales de colaboración como invitaciones y actualizaciones de solicitudes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <Checkbox
                                checked={data.collaboration_emails}
                                onCheckedChange={(checked) => setData('collaboration_emails', checked === true)}
                            />
                            <span className="space-y-1">
                                <span className="block text-sm font-medium text-foreground">Recibir emails opcionales de colaboración</span>
                                <span className="block text-sm text-muted-foreground">
                                    Controla solo correos opcionales de colaboración; los emails de seguridad y acceso siguen llegando siempre.
                                </span>
                            </span>
                        </label>
                        <FormError message={errors.collaboration_emails} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>Guardar cambios</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
