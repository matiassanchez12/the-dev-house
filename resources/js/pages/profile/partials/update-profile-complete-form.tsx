import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avatarUrl } from '@/components/projects/project-utils'
import {
    DEFAULT_TECH_PROFICIENCY,
    getTechProficiencyFromSlider,
    type TechProficiency,
} from '@/lib/tech-proficiency'
import type { SharedPageProps, Tech, User } from '@/types'
import { Transition } from '@headlessui/react'
import { useForm, usePage } from '@inertiajs/react'
import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TECH_YEARS_MIN, type ProfileTechFormEntry } from './profile-tech-form'
import ProfileTechSelector from './profile-tech-selector'

interface UserTech extends Omit<Tech, 'pivot'> {
    pivot: {
        years_experience: number | null
        proficiency: TechProficiency | null
    }
}

interface ProfileFormData {
    bio: string
    avatar: File | null
    techs: ProfileTechFormEntry[]
}

interface Props {
    className?: string
    userTechs: UserTech[]
    allTechs: Tech[]
}

export default function UpdateProfileCompleteForm({ className = '', userTechs, allTechs }: Props) {
    const { auth } = usePage<SharedPageProps & { auth: { user: User } }>().props
    const user = auth.user
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(avatarUrl(user.avatar))

    const { data, setData, post, processing, errors, recentlySuccessful, transform } =
        useForm<ProfileFormData>({
            bio: user.bio ?? '',
            avatar: null,
            techs: userTechs.map((tech) => ({
                id: tech.id,
                years_experience: tech.pivot?.years_experience ?? TECH_YEARS_MIN,
                proficiency: tech.pivot?.proficiency ?? DEFAULT_TECH_PROFICIENCY,
            })),
        })

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setData('avatar', file)

        const reader = new FileReader()
        reader.onload = (loadEvent) => {
            setPreviewAvatar(loadEvent.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleTechToggle = (techId: number, checked: boolean) => {
        if (checked) {
            setData('techs', [
                ...data.techs,
                {
                    id: techId,
                    years_experience: TECH_YEARS_MIN,
                    proficiency: DEFAULT_TECH_PROFICIENCY,
                },
            ])
            return
        }

        setData(
            'techs',
            data.techs.filter((tech) => tech.id !== techId),
        )
    }

    const handleTechUpdate = (
        techId: number,
        field: 'years_experience' | 'proficiency',
        value: string | number,
    ) => {
        setData(
            'techs',
            data.techs.map((tech) => {
                if (tech.id !== techId) {
                    return tech
                }

                return field === 'proficiency'
                    ? {
                          ...tech,
                          proficiency:
                              typeof value === 'number'
                                  ? getTechProficiencyFromSlider(value)
                                  : tech.proficiency,
                      }
                    : {
                          ...tech,
                          years_experience: Number(value),
                      }
            }),
        )
    }

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        transform((formData) => ({
            ...formData,
            techs: JSON.stringify(formData.techs),
        }))

        post(route('profile.update-complete'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Perfil actualizado exitosamente'),
            onError: () => toast.error('Error al actualizar el perfil'),
        })
    }

    return (
        <section className={className}>
            <form onSubmit={submit} className="flex flex-col gap-6">
                <Card size="sm">
                    <CardHeader>
                        <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                            Biografía
                        </h3>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Field
                            id="bio"
                            label="Biografía"
                            labelClassName="sr-only"
                            error={errors.bio}
                        >
                            <Textarea
                                value={data.bio}
                                onChange={(event) => setData('bio', event.target.value)}
                                rows={4}
                                placeholder="Contale a la comunidad sobre vos, tu experiencia y qué te gustaría construir..."
                            />
                        </Field>
                        <p className="text-sm text-muted-foreground">
                            {data.bio.length}/1000 caracteres
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardHeader>
                        <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                            Foto de Perfil
                        </h3>
                        <CardDescription>JPG, PNG o GIF. Máximo 2MB.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Avatar size="lg">
                            {previewAvatar ? (
                                <AvatarImage src={previewAvatar} alt="Vista previa del avatar" />
                            ) : null}
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <Field
                                id="avatar"
                                label="Foto de perfil"
                                labelClassName="sr-only"
                                error={errors.avatar}
                            >
                                <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardHeader>
                        <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                            Stack Tecnológico
                        </h3>
                        <CardDescription>
                            Seleccioná las tecnologías que conocés y tu nivel de experiencia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileTechSelector
                            allTechs={allTechs}
                            selectedTechs={data.techs}
                            error={errors.techs}
                            onToggleTech={handleTechToggle}
                            onUpdateTech={handleTechUpdate}
                        />
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar Cambios
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
                </div>
            </form>
        </section>
    )
}
