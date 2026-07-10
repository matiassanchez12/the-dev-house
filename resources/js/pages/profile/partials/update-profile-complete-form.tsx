import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Field } from '@/components/ui/field';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Tech, User } from '@/types';
import { toast } from 'sonner';
import { avatarUrl } from '@/components/projects/project-utils';
import {
    DEFAULT_TECH_PROFICIENCY,
    getTechProficiencyLabel,
    getTechProficiencySliderValue,
    getTechProficiencyFromSlider,
    type TechProficiency,
} from '@/lib/tech-proficiency';

interface UserTech extends Omit<Tech, 'pivot'> {
    pivot: {
        years_experience: number | null;
        proficiency: TechProficiency | null;
    };
}

interface TechFormEntry {
    id: number;
    years_experience: number;
    proficiency: TechProficiency;
}

interface ProfileFormData {
    bio: string;
    avatar: File | null;
    techs: TechFormEntry[];
}

interface Props {
    className?: string;
    userTechs: UserTech[];
    allTechs: Tech[];
}

export default function UpdateProfileCompleteForm({ className = '', userTechs, allTechs }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(
        avatarUrl(user.avatar)
    );

    // Convert proficiency number to string for the form
    const { data, setData, post, processing, errors, recentlySuccessful, transform } = useForm<ProfileFormData>({
        bio: user.bio ?? '',
        avatar: null as File | null,
        techs: userTechs.map((ut) => ({
            id: ut.id,
            years_experience: ut.pivot?.years_experience ?? 0,
            proficiency: ut.pivot?.proficiency ?? DEFAULT_TECH_PROFICIENCY,
        })),
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('avatar', file);
            
            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTechToggle = (techId: number, checked: boolean) => {
        if (checked) {
            setData('techs', [
                ...data.techs,
                { id: techId, years_experience: 0, proficiency: DEFAULT_TECH_PROFICIENCY },
            ]);
        } else {
            setData('techs', data.techs.filter((t) => t.id !== techId));
        }
    };

    const handleTechUpdate = (techId: number, field: 'years_experience' | 'proficiency', value: string | number) => {
        setData(
            'techs',
            data.techs.map((tech) => {
                if (tech.id !== techId) return tech;

                if (field === 'proficiency') {
                    return {
                        ...tech,
                        proficiency: typeof value === 'number'
                            ? getTechProficiencyFromSlider(value)
                            : tech.proficiency,
                    };
                }

                return {
                    ...tech,
                    years_experience: Number(value),
                };
            }),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            techs: JSON.stringify(formData.techs),
        }));

        post(route('profile.update-complete'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Perfil actualizado exitosamente'),
            onError: () => toast.error('Error al actualizar el perfil'),
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                {/* Bio */}
                <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Biografía</h3>
                    <Field id="bio" label="Biografía" labelClassName="sr-only" error={errors.bio}>
                        <Textarea
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="w-full"
                            rows={4}
                            placeholder="Contale a la comunidad sobre vos, tu experiencia y qué te gustaría construir..."
                        />
                    </Field>
                    <p className="text-sm text-muted-foreground mt-1">
                        {data.bio.length}/1000 caracteres
                    </p>
                </div>

                {/* Avatar */}
                <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Foto de Perfil</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {previewAvatar ? (
                                <Avatar size="lg">
                                    <AvatarImage src={previewAvatar} alt="Avatar preview" />
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ) : (
                                <Avatar size="lg">
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        <div className="flex-1">
                            <Field id="avatar" label="Foto de perfil" labelClassName="sr-only" error={errors.avatar}>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="block w-full text-sm text-muted-foreground"
                                />
                            </Field>
                            <p className="text-sm text-muted-foreground mt-1">
                                JPG, PNG o GIF. Máximo 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">Stack Tecnológico</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Seleccioná las tecnologías que conocés y tu nivel de experiencia
                    </p>

                    {/* Selected techs summary */}
                    {data.techs.length > 0 && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                                {data.techs.length} tecnología{data.techs.length !== 1 ? 's' : ''} seleccionada{data.techs.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.techs.map((tech) => (
                                    <span
                                        key={tech.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                    >
                                        {allTechs.find((t) => t.id === tech.id)?.name}
                                        <button
                                            type="button"
                                            onClick={() => handleTechToggle(tech.id, false)}
                                            className="hover:text-primary/70"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Techs grouped by letter */}
                    <div className="space-y-2">
                        {Object.entries(
                            allTechs.reduce((acc, tech) => {
                                const letter = tech.name[0].toUpperCase();
                                if (!acc[letter]) acc[letter] = [];
                                acc[letter].push(tech);
                                return acc;
                            }, {} as Record<string, typeof allTechs>)
                        ).sort(([a], [b]) => a.localeCompare(b)).map(([letter, techs]) => {
                            const selectedCount = techs.filter((t) =>
                                data.techs.some((ut) => ut.id === t.id)
                            ).length;

                            return (
                                    <details key={letter} open={selectedCount > 0} className="group border border-border rounded-lg overflow-hidden">
                                    <summary className="flex items-center justify-between px-4 py-2 cursor-pointer list-none bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{letter}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ({techs.length} tecnología{techs.length !== 1 ? 's' : ''})
                                            </span>
                                            {selectedCount > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                    {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <svg
                                            className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </summary>
                                    <div className="divide-y divide-border">
                                        {techs.map((tech) => {
                                            const userTech = data.techs.find((t) => t.id === tech.id);
                                            const isSelected = !!userTech;

                                            return (
                                                <div key={tech.id} className="px-4 py-3">
                                                    <label className="flex items-center justify-between cursor-pointer">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => handleTechToggle(tech.id, e.target.checked)}
                                                                className="rounded border-input text-primary focus:ring-primary"
                                                            />
                                                            <span className={`text-sm ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                                {tech.name}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="text-xs text-primary">
                                                                {getTechProficiencyLabel(userTech.proficiency) ?? getTechProficiencyLabel(DEFAULT_TECH_PROFICIENCY)}
                                                            </span>
                                                        )}
                                                    </label>

                                                        {isSelected && (
                                                            <div className="mt-3 ml-6 space-y-3 p-3 bg-muted/30 rounded-lg">
                                                                <div>
                                                                    <Field
                                                                        id={`tech-${tech.id}-years`}
                                                                        label={`${tech.name} años de experiencia`}
                                                                        labelClassName="sr-only"
                                                                    >
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="50"
                                                                            step="1"
                                                                            value={userTech.years_experience}
                                                                            onChange={(e) =>
                                                                                handleTechUpdate(tech.id, 'years_experience', e.target.value)
                                                                            }
                                                                            className="w-full text-sm px-2 py-1 bg-background"
                                                                            placeholder="Ej: 3"
                                                                        />
                                                                    </Field>
                                                                </div>
                                                                <div>
                                                                    <Field
                                                                        id={`tech-${tech.id}-proficiency`}
                                                                        label={`${tech.name} nivel de experiencia`}
                                                                        labelClassName="sr-only"
                                                                    >
                                                                        <input
                                                                            type="range"
                                                                            min="1"
                                                                            max="5"
                                                                            value={getTechProficiencySliderValue(userTech.proficiency)}
                                                                            onChange={(e) =>
                                                                                handleTechUpdate(tech.id, 'proficiency', parseInt(e.target.value))
                                                                            }
                                                                            className="w-full accent-primary"
                                                                            aria-valuetext={getTechProficiencyLabel(userTech.proficiency) ?? getTechProficiencyLabel(DEFAULT_TECH_PROFICIENCY) ?? undefined}
                                                                        />
                                                                    </Field>
                                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                        <span>Principiante</span>
                                                                        <span>Experto</span>
                                                                    </div>
                                                                </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                    <FormError message={errors.techs} className="mt-2" />
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>Guardar Cambios</Button>

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
