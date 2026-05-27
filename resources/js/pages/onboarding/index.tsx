import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import OnboardingLayout from '@/layouts/onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Tech } from '@/types';

interface OnboardingProps {
    auth: {
        user: User;
    };
    user: {
        bio: string | null;
        avatar: string | null;
    };
    allTechs: Tech[];
    userTechs: (Tech & { pivot?: { proficiency?: string } })[];
}

const PROFICIENCY_MAP: Record<number, string> = {
    1: 'Principiante',
    2: 'Básico',
    3: 'Intermedio',
    4: 'Avanzado',
    5: 'Experto',
};

const PROFICIENCY_REVERSE_MAP: Record<string, number> = {
    basic: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
    master: 5,
};

interface SelectedTech {
    id: number;
    name: string;
    slug: string;
    proficiency: number;
}

interface Recommendation {
    id: number;
    title: string;
    description: string;
    slug: string;
    techs: { id: number; name: string }[];
    creator: { id: number; name: string } | null;
}

export default function OnboardingIndex() {
    const { auth, user, allTechs, userTechs } = usePage<OnboardingProps>().props;

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Step 1: Tech selection
    const [selectedTechs, setSelectedTechs] = useState<SelectedTech[]>(() => {
        return userTechs.map((tech) => ({
            id: tech.id,
            name: tech.name,
            slug: tech.slug,
            proficiency: PROFICIENCY_REVERSE_MAP[tech.pivot?.proficiency || 'advanced'] ?? 3,
        }));
    });

    const toggleTech = (tech: Tech) => {
        setSelectedTechs((prev) => {
            const exists = prev.find((t) => t.id === tech.id);
            if (exists) {
                return prev.filter((t) => t.id !== tech.id);
            }
            return [...prev, { id: tech.id, name: tech.name, slug: tech.slug, proficiency: 3 }];
        });
    };

    const updateTechProficiency = (techId: number, proficiency: number) => {
        setSelectedTechs((prev) =>
            prev.map((t) => (t.id === techId ? { ...t, proficiency } : t))
        );
    };

    // Step 2: Bio
    const [bio, setBio] = useState(user.bio || '');

    // Step 3: Avatar
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (avatarFile) {
            const url = URL.createObjectURL(avatarFile);
            setAvatarPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [avatarFile]);

    // Step 4: Recommendations
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    useEffect(() => {
        if (currentStep === 4 && recommendations.length === 0) {
            setLoadingRecommendations(true);
            fetch('/onboarding/recommendations')
                .then((res) => res.json())
                .then((data) => {
                    setRecommendations(data.projects || []);
                    setLoadingRecommendations(false);
                })
                .catch(() => {
                    setLoadingRecommendations(false);
                });
        }
    }, [currentStep]);

    const toggleProject = (projectId: number) => {
        setSelectedProjects((prev) =>
            prev.includes(projectId)
                ? prev.filter((id) => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleNext = () => {
        if (currentStep === 1) {
            router.post(
                '/onboarding/step-1',
                { techs: selectedTechs.map((t) => ({ id: t.id, proficiency: t.proficiency })) },
                { preserveScroll: true }
            );
            setCurrentStep(2);
        } else if (currentStep === 2) {
            router.post(
                '/onboarding/step-2',
                { bio },
                { preserveScroll: true }
            );
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                router.post('/onboarding/step-3', formData, {
                    forceFormData: true,
                    preserveScroll: true,
                });
            }
            setCurrentStep(4);
        } else if (currentStep === 4) {
            router.post(
                '/onboarding/step-4',
                { join_requests: selectedProjects },
                { preserveScroll: true }
            );
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        router.post('/onboarding/skip', {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Welcome to The Dev House" />
            <OnboardingLayout currentStep={currentStep} totalSteps={totalSteps}>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentStep === 1 && '¿En qué tecnologías trabajas?'}
                            {currentStep === 2 && 'Cuéntanos sobre ti'}
                            {currentStep === 3 && '¿Cómo te ves?'}
                            {currentStep === 4 && 'Proyectos recomendados'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Seleccioná tus tecnologías y nivel de experiencia'}
                            {currentStep === 2 && 'Escribí una breve bio para que otros te conozcan'}
                            {currentStep === 3 && 'Subí una foto de perfil (opcional)'}
                            {currentStep === 4 && 'Encontrá proyectos que coincidan con tus skills'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Tech Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {allTechs.map((tech) => {
                                        const isSelected = selectedTechs.some((t) => t.id === tech.id);
                                        return (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => toggleTech(tech)}
                                                className={`p-3 rounded-lg border text-left transition-colors ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <span className="text-sm font-medium text-foreground">
                                                    {tech.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedTechs.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">
                                            Nivel de experiencia
                                        </label>
                                        {selectedTechs.map((tech) => (
                                            <div
                                                key={tech.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border"
                                            >
                                                <span className="text-sm text-foreground">
                                                    {tech.name}
                                                </span>
                                                <select
                                                    value={tech.proficiency}
                                                    onChange={(e) =>
                                                        updateTechProficiency(
                                                            tech.id,
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                                                >
                                                    {Object.entries(PROFICIENCY_MAP).map(
                                                        ([level, label]) => (
                                                            <option
                                                                key={level}
                                                                value={parseInt(level)}
                                                            >
                                                                {label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Bio */}
                        {currentStep === 2 && (
                            <div className="space-y-3">
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={1000}
                                    placeholder="Cuéntanos sobre vos, tu experiencia y qué te apasiona..."
                                    rows={5}
                                    className="w-full"
                                />
                                <div className="text-right text-sm text-muted-foreground">
                                    {bio.length}/1000
                                </div>
                            </div>
                        )}

                        {/* Step 3: Avatar */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Current avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl text-muted-foreground">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setAvatarFile(file);
                                            }}
                                            className="text-sm text-muted-foreground"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Máximo 2MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Recommendations */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                {loadingRecommendations ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Cargando proyectos recomendados...
                                    </div>
                                ) : recommendations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay proyectos recomendados por ahora
                                    </div>
                                ) : (
                                    recommendations.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-start gap-3 p-4 rounded-lg border border-border"
                                        >
                                            <Checkbox
                                                id={`project-${project.id}`}
                                                checked={selectedProjects.includes(project.id)}
                                                onChange={() => toggleProject(project.id)}
                                                className="mt-1"
                                            />
                                            <label
                                                htmlFor={`project-${project.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-foreground">
                                                            {project.title}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {project.description.length > 120
                                                                ? project.description.slice(0, 120) +
                                                                  '...'
                                                                : project.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {project.techs.map((tech) => (
                                                        <Badge
                                                            key={tech.id}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {tech.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                Atrás
                            </Button>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={handleSkip}>
                                    Saltar
                                </Button>
                                <Button onClick={handleNext}>
                                    {currentStep === 4 ? 'Finalizar' : 'Siguiente'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </OnboardingLayout>
        </>
    );
}
