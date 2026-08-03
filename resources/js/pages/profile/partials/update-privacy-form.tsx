import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useForm } from '@inertiajs/react'
import { Transition } from '@headlessui/react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import type { PrivacySetting } from '@/types'

interface Props {
    phone: string | null
    privacySetting: PrivacySetting
    className?: string
}

interface PrivacyFormData {
    phone: string
    show_email: boolean
    show_phone: boolean
    is_discoverable: boolean
    show_activity: boolean
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
] satisfies Array<{
    key: keyof Omit<PrivacyFormData, 'phone'>
    label: string
    description: string
}>

export default function UpdatePrivacyForm({ phone, privacySetting, className = '' }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful, transform } =
        useForm<PrivacyFormData>({
            phone: phone ?? '',
            show_email: privacySetting.show_email,
            show_phone: privacySetting.show_phone,
            is_discoverable: privacySetting.is_discoverable,
            show_activity: privacySetting.show_activity,
        })

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        transform((formData) => ({
            ...formData,
            phone: formData.phone.trim() === '' ? null : formData.phone.trim(),
        }))

        post(route('profile.privacy.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Privacidad actualizada'),
            onError: () => toast.error('Error al actualizar la privacidad'),
        })
    }

    return (
        <Card className={className}>
            <CardHeader>
                <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                    Privacidad y contacto
                </h3>
                <CardDescription>
                    Definí qué datos pueden ver las personas que visitan tu perfil.
                </CardDescription>
            </CardHeader>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
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
                            Tu teléfono se guarda solo para tu perfil y podés dejarlo vacío si no
                            querés mostrarlo.
                        </p>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        {privacyFields.map((field) => {
                            const errorId = `privacy-${field.key}-error`

                            return (
                                <div key={field.key} className="flex flex-col gap-2">
                                    <label className="flex items-start gap-3 rounded-none border border-border/60 p-4">
                                        <Checkbox
                                            checked={data[field.key]}
                                            onCheckedChange={(checked) =>
                                                setData(field.key, checked === true)
                                            }
                                            aria-describedby={
                                                errors[field.key] ? errorId : undefined
                                            }
                                            aria-invalid={errors[field.key] ? true : undefined}
                                        />
                                        <span className="flex flex-col gap-1">
                                            <span className="block text-sm font-medium text-foreground">
                                                {field.label}
                                            </span>
                                            <span className="block text-sm text-muted-foreground">
                                                {field.description}
                                            </span>
                                        </span>
                                    </label>
                                    <FormError id={errorId} message={errors[field.key]} />
                                </div>
                            )
                        })}
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
