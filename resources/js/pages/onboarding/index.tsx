import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import OnboardingLayout from '@/layouts/onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Tech, Platform, SocialLink } from '@/types';

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
    const totalSteps = 5;

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

    // Step 3: Social Links
    const [socialLinks, setSocialLinks] = useState<Record<Platform, string>>({
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
    });

    const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
        github: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
        ),
        linkedin: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        twitter: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        website: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
        ),
    };

    const PLATFORM_LABELS: Record<Platform, string> = {
        github: 'GitHub',
        linkedin: 'LinkedIn',
        twitter: 'X (Twitter)',
        website: 'Sitio Web',
    };

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

    // Step 5: Recommendations
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    useEffect(() => {
        if (currentStep === 5 && recommendations.length === 0) {
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
            const links: SocialLink[] = Object.entries(socialLinks)
                .filter(([, url]) => url.trim() !== '')
                .map(([platform, url]) => ({ platform: platform as Platform, url }));

            if (links.length > 0) {
                router.post(
                    '/onboarding/step-social-links',
                    { links },
                    { preserveScroll: true }
                );
            }
            setCurrentStep(4);
        } else if (currentStep === 4) {
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                router.post('/onboarding/step-3', formData, {
                    forceFormData: true,
                    preserveScroll: true,
                });
            }
            setCurrentStep(5);
        } else if (currentStep === 5) {
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
                            {currentStep === 3 && 'Tus redes sociales'}
                            {currentStep === 4 && '¿Cómo te ves?'}
                            {currentStep === 5 && 'Proyectos recomendados'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Seleccioná tus tecnologías y nivel de experiencia'}
                            {currentStep === 2 && 'Escribí una breve bio para que otros te conozcan'}
                            {currentStep === 3 && 'Compartí tus perfiles profesionales (opcional)'}
                            {currentStep === 4 && 'Subí una foto de perfil (opcional)'}
                            {currentStep === 5 && 'Encontrá proyectos que coincidan con tus skills'}
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

                        {/* Step 3: Social Links */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
                                    <div key={platform} className="flex items-center gap-3">
                                        <div className="text-muted-foreground flex-shrink-0">
                                            {PLATFORM_ICONS[platform]}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="url"
                                                value={socialLinks[platform]}
                                                onChange={(e) =>
                                                    setSocialLinks((prev) => ({
                                                        ...prev,
                                                        [platform]: e.target.value,
                                                    }))
                                                }
                                                placeholder={`https://...`}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-24 flex-shrink-0">
                                            {PLATFORM_LABELS[platform]}
                                        </span>
                                    </div>
                                ))}

                                {/* Preview */}
                                {Object.values(socialLinks).some((url) => url.trim() !== '') && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.keys(socialLinks) as Platform[])
                                                .filter((p) => socialLinks[p].trim() !== '')
                                                .map((platform) => (
                                                    <a
                                                        key={platform}
                                                        href={socialLinks[platform]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-sm"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {PLATFORM_ICONS[platform]}
                                                        </span>
                                                        <span className="text-foreground">
                                                            {PLATFORM_LABELS[platform]}
                                                        </span>
                                                    </a>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Avatar */}
                        {currentStep === 4 && (
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

                        {/* Step 5: Recommendations */}
                        {currentStep === 5 && (
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
                                    {currentStep === 5 ? 'Finalizar' : 'Siguiente'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </OnboardingLayout>
        </>
    );
}
