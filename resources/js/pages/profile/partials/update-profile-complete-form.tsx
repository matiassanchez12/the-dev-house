import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Tech } from '@/types';
import { toast } from 'sonner';

interface UserTech extends Tech {
    pivot: {
        years_experience: number | null;
        proficiency: number | null;
    };
}

interface TechFormEntry {
    id: number;
    years_experience: number;
    proficiency: string;
}

interface ProfileFormData {
    bio: string;
    avatar: File | null;
    techs: TechFormEntry[];
    _method: 'post';
}

interface Props {
    className?: string;
    userTechs: UserTech[];
    allTechs: Tech[];
}

export default function UpdateProfileCompleteForm({ className = '', userTechs, allTechs }: Props) {
    const user = usePage().props.auth.user;
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(
        user.avatar_url || (user.avatar ? `/storage/${user.avatar}` : null)
    );
    const avatarInput = useRef<HTMLInputElement>(null);

    // Convert proficiency number to string for the form
    const proficiencyMap: Record<number, string> = {
        1: 'basic',
        2: 'intermediate',
        3: 'advanced',
        4: 'expert',
        5: 'master',
    };

    // Reverse map: string to number for range slider display
    const stringToNumber: Record<string, number> = {
        'basic': 1,
        'intermediate': 2,
        'advanced': 3,
        'expert': 4,
        'master': 5,
    };

    const proficiencyLabels: Record<string, string> = {
        'basic': 'Principiante',
        'intermediate': 'Básico',
        'advanced': 'Intermedio',
        'expert': 'Avanzado',
        'master': 'Experto',
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<ProfileFormData>({
        bio: user.bio ?? '',
        avatar: null as File | null,
        techs: userTechs.map((ut) => ({
            id: ut.id,
            years_experience: ut.pivot?.years_experience ?? 0,
            proficiency: typeof ut.pivot?.proficiency === 'string'
                ? ut.pivot.proficiency
                : (ut.pivot?.proficiency ? proficiencyMap[ut.pivot.proficiency] : 'intermediate'),
        })),
        _method: 'post' as const,
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
                { id: techId, years_experience: 0, proficiency: 'intermediate' },
            ]);
        } else {
            setData('techs', data.techs.filter((t) => t.id !== techId));
        }
    };

    const handleTechUpdate = (techId: number, field: 'years_experience' | 'proficiency', value: string | number) => {
        const finalValue = field === 'proficiency' && typeof value === 'number'
            ? proficiencyMap[value]
            : (field === 'years_experience' ? Number(value) : value);
        setData('techs', data.techs.map((t) => (t.id === techId ? { ...t, [field]: finalValue } : t)));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
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
                    <textarea
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        className="w-full border-input bg-background rounded-md shadow-sm focus:border-ring focus:ring-ring"
                        rows={4}
                        placeholder="Contale a la comunidad sobre vos, tu experiencia y qué te gustaría construir..."
                    />
                    <InputError message={errors.bio} className="mt-2" />
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
                            <input
                                ref={avatarInput}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="block w-full text-sm text-muted-foreground
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary/10 file:text-primary
                                    hover:file:bg-primary/20"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                JPG, PNG o GIF. Máximo 2MB.
                            </p>
                            <InputError message={errors.avatar} className="mt-2" />
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
                                <details key={letter} className="group border border-border rounded-lg overflow-hidden">
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
                                                                {proficiencyLabels[userTech.proficiency]}
                                                            </span>
                                                        )}
                                                    </label>

                                                    {isSelected && (
                                                        <div className="mt-3 ml-6 space-y-3 p-3 bg-muted/30 rounded-lg">
                                                            <div>
                                                                <label className="text-xs text-muted-foreground block mb-1">
                                                                    Años de experiencia
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="50"
                                                                    value={userTech.years_experience}
                                                                    onChange={(e) =>
                                                                        handleTechUpdate(tech.id, 'years_experience', e.target.value)
                                                                    }
                                                                    className="w-full border border-input rounded-md text-sm px-2 py-1 bg-background focus:border-ring focus:ring-1 focus:ring-ring"
                                                                    placeholder="Ej: 3"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-muted-foreground block mb-1">
                                                                    Nivel: {proficiencyLabels[userTech.proficiency]}
                                                                </label>
                                                                <input
                                                                    type="range"
                                                                    min="1"
                                                                    max="5"
                                                                    value={stringToNumber[userTech.proficiency] || 3}
                                                                    onChange={(e) =>
                                                                        handleTechUpdate(tech.id, 'proficiency', parseInt(e.target.value))
                                                                    }
                                                                    className="w-full accent-primary"
                                                                />
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
                    <InputError message={errors.techs} className="mt-2" />
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
