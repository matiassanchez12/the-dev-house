import InputError from '@/components/input-error';
import PrimaryButton from '@/components/primary-button';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Tech } from '@/types';

interface UserTech extends Tech {
    pivot: {
        years_experience: number | null;
        proficiency: number | null;
    };
}

interface Props {
    className?: string;
    userTechs: UserTech[];
    allTechs: Tech[];
}

export default function UpdateProfileCompleteForm({ className = '', userTechs, allTechs }: Props) {
    const user = usePage().props.auth.user;
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(user.avatar ? `/storage/${user.avatar}` : null);
    const avatarInput = useRef<HTMLInputElement>(null);

    // Convert proficiency number to string for the form
    const proficiencyMap: Record<number, string> = {
        1: 'basic',
        2: 'intermediate',
        3: 'advanced',
        4: 'expert',
        5: 'master',
    };

    const proficiencyLabels: Record<string, string> = {
        'basic': 'Principiante',
        'intermediate': 'Básico',
        'advanced': 'Intermedio',
        'expert': 'Avanzado',
        'master': 'Experto',
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        bio: user.bio ?? '',
        avatar: null as File | null,
        techs: userTechs.map((ut) => ({
            id: ut.id,
            years_experience: ut.pivot?.years_experience ?? '',
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
                { id: techId, years_experience: '', proficiency: 'intermediate' },
            ]);
        } else {
            setData('techs', data.techs.filter((t) => t.id !== techId));
        }
    };

    const handleTechUpdate = (techId: number, field: 'years_experience' | 'proficiency', value: string | number) => {
        // Convert proficiency number to string
        const finalValue = field === 'proficiency' && typeof value === 'number'
            ? proficiencyMap[value]
            : value;
        setData('techs', data.techs.map((t) => (t.id === techId ? { ...t, [field]: finalValue } : t)));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update-complete'), {
            forceFormData: true,
            preserveScroll: true,
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
                                <img
                                    src={previewAvatar}
                                    alt="Avatar preview"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-input"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl text-muted-foreground">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allTechs.map((tech) => {
                            const userTech = data.techs.find((t) => t.id === tech.id);
                            const isSelected = !!userTech;

                            return (
                                <div
                                    key={tech.id}
                                    className={`border rounded-lg p-4 transition ${
                                        isSelected ? 'border-primary bg-primary/5' : 'border-input'
                                    }`}
                                >
                                    <label className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleTechToggle(tech.id, e.target.checked)}
                                                className="rounded border-input text-primary focus:ring-primary"
                                            />
                                            <span className="font-medium text-foreground">{tech.name}</span>
                                        </div>
                                        {isSelected && (
                                            <span className="text-xs text-primary">✓ Seleccionado</span>
                                        )}
                                    </label>

                                    {isSelected && (
                                        <div className="space-y-3 ml-6">
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
                                                    className="w-full border-input rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                                                    placeholder="Ej: 3"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground block mb-1">
                                                    Nivel de dominio (1-5)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={userTech.proficiency}
                                                    onChange={(e) =>
                                                        handleTechUpdate(tech.id, 'proficiency', parseInt(e.target.value))
                                                    }
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>Principiante</span>
                                                    <span className="font-medium text-primary">
                                                        {userTech.proficiency === 1 && 'Principiante'}
                                                        {userTech.proficiency === 2 && 'Básico'}
                                                        {userTech.proficiency === 3 && 'Intermedio'}
                                                        {userTech.proficiency === 4 && 'Avanzado'}
                                                        {userTech.proficiency === 5 && 'Experto'}
                                                    </span>
                                                    <span>Experto</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <InputError message={errors.techs} className="mt-2" />
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar Cambios</PrimaryButton>

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
