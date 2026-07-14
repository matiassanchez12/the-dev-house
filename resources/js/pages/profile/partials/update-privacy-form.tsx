import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { PrivacySetting } from '@/types';

interface Props {
    phone: string | null;
    privacySetting: PrivacySetting;
    className?: string;
}

interface PrivacyFormData {
    phone: string;
    show_email: boolean;
    show_phone: boolean;
    is_discoverable: boolean;
    show_activity: boolean;
    email_notifications_enabled: boolean;
}

const privacyFields = [
    {
        key: 'show_email' as const,
        label: 'Mostrar correo electrónico',
        description: 'Cualquiera que visite tu perfil podrá ver tu correo.',
    },
    {
        key: 'show_phone' as const,
        label: 'Mostrar teléfono',
        description: 'Tu teléfono será visible en tu perfil público.',
    },
    {
        key: 'is_discoverable' as const,
        label: 'Ser descubrible en el directorio',
        description: 'Tu perfil podrá aparecer en el directorio.',
    },
    {
        key: 'show_activity' as const,
        label: 'Mostrar actividad pública',
        description: 'Tu actividad pública podrá mostrarse a otros usuarios.',
    },
    {
        key: 'email_notifications_enabled' as const,
        label: 'Recibir emails opcionales de colaboración',
        description: 'Solo controla correos opcionales de colaboración, como invitaciones a proyectos y actualizaciones de solicitudes de ingreso.',
    },
] satisfies Array<{
    key: keyof Omit<PrivacyFormData, 'phone'>;
    label: string;
    description: string;
}>;

export default function UpdatePrivacyForm({ phone, privacySetting, className = '' }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful, transform } = useForm<PrivacyFormData>({
        phone: phone ?? '',
        show_email: privacySetting.show_email,
        show_phone: privacySetting.show_phone,
        is_discoverable: privacySetting.is_discoverable,
        show_activity: privacySetting.show_activity,
        email_notifications_enabled: privacySetting.email_notifications_enabled,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            phone: formData.phone.trim() === '' ? null : formData.phone.trim(),
        }));

        post(route('profile.privacy.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Privacidad actualizada'),
            onError: () => toast.error('Error al actualizar la privacidad'),
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-foreground">Privacidad y contacto</h3>
                        <p className="text-sm text-muted-foreground">
                            Definí qué datos pueden ver las personas que visitan tu perfil.
                        </p>
                    </div>

                    <Field id="phone" label="Teléfono" error={errors.phone}>
                        <Input
                            type="tel"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                            placeholder="Ej: +54 11 5555-5555"
                            autoComplete="tel"
                        />
                    </Field>

                    <p className="text-sm text-muted-foreground">
                        Tu teléfono se guarda solo para tu perfil y podés dejarlo vacío si no querés mostrarlo.
                    </p>
                </div>

                <div className="space-y-4">
                    {privacyFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                                <Checkbox
                                    checked={data[field.key]}
                                    onCheckedChange={(checked) => setData(field.key, checked === true)}
                                />
                                <span className="space-y-1">
                                    <span className="block text-sm font-medium text-foreground">{field.label}</span>
                                    <span className="block text-sm text-muted-foreground">{field.description}</span>
                                </span>
                            </label>
                            <FormError message={errors[field.key]} />
                        </div>
                    ))}
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
