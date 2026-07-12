import Seo from '@/components/seo';
import { router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import type { SharedPageProps } from '@/types';
import { toast } from 'sonner';
import OnboardingLayout from '@/layouts/onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Field } from '@/components/ui/field';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User, Tech, Platform, SocialLink } from '@/types';
import { avatarUrl } from '@/components/projects/project-utils';

const MAX_SELECTED_TECHS = 3;

interface OnboardingProps extends SharedPageProps {
    auth: {
        user: User;
    };
    user: {
        bio: string | null;
        avatar: string | null;
    };
    allTechs: Tech[];
    userTechs: (Tech & { pivot?: { proficiency?: string } })[];
    totalSteps: number;
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
    const { auth, user, allTechs, userTechs, totalSteps, errors } = usePage<OnboardingProps>().props;

    const [currentStep, setCurrentStep] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [confirmingSkip, setConfirmingSkip] = useState(false);

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
            if (prev.length >= MAX_SELECTED_TECHS) {
                toast.error(`Podés elegir hasta ${MAX_SELECTED_TECHS} tecnologías.`);
                return prev;
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
    const [socialLinks, setSocialLinks] = useState<Partial<Record<Platform, string>>>({
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
    });

    const PLATFORM_ICONS: Partial<Record<Platform, React.ReactNode>> = {
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

    const PLATFORM_LABELS: Partial<Record<Platform, string>> = {
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
    const [loadRecommendationsError, setLoadRecommendationsError] = useState(false);
    const [recommendationsAttempt, setRecommendationsAttempt] = useState(0);

    useEffect(() => {
        if (currentStep !== 5) {
            return;
        }
        if (recommendations.length > 0 || loadRecommendationsError) {
            return;
        }
        setLoadingRecommendations(true);
        setLoadRecommendationsError(false);
        fetch('/onboarding/recommendations')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setRecommendations(data.projects || []);
                setLoadingRecommendations(false);
            })
            .catch(() => {
                setLoadingRecommendations(false);
                setLoadRecommendationsError(true);
            });
    }, [currentStep, recommendationsAttempt]);

    const retryRecommendations = () => {
        setLoadRecommendationsError(false);
        setRecommendations([]);
        setRecommendationsAttempt((prev) => prev + 1);
    };

    const toggleProject = (projectId: number) => {
        setSelectedProjects((prev) =>
            prev.includes(projectId)
                ? prev.filter((id) => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleNext = () => {
        if (processing) return;

        if (currentStep === 1) {
            setProcessing(true);
            router.post(
                '/onboarding/step-1',
                { techs: selectedTechs.map((t) => ({ id: t.id, proficiency: t.proficiency })) },
                {
                    preserveScroll: true,
                    onSuccess: () => setCurrentStep(2),
                    onError: () => toast.error('No pudimos guardar tu stack. Revisá tu conexión e intentá de nuevo.'),
                    onFinish: () => setProcessing(false),
                }
            );
        } else if (currentStep === 2) {
            setProcessing(true);
            router.post(
                '/onboarding/step-2',
                { bio },
                {
                    preserveScroll: true,
                    onSuccess: () => setCurrentStep(3),
                    onError: () => toast.error('No pudimos guardar tu objetivo. Revisá tu conexión e intentá de nuevo.'),
                    onFinish: () => setProcessing(false),
                }
            );
        } else if (currentStep === 3) {
            const links = Object.entries(socialLinks)
                .filter(([, url]) => url.trim() !== '')
                .map(([platform, url]) => ({ platform: platform as Platform, url }));

            if (links.length === 0) {
                setCurrentStep(4);
                return;
            }

            setProcessing(true);
            router.post(
                '/onboarding/step-social-links',
                { links: links.map((l) => ({ platform: l.platform, url: l.url })) },
                {
                    preserveScroll: true,
                    onSuccess: () => setCurrentStep(4),
                    onError: () => toast.error('No pudimos guardar tus links. Revisá tu conexión e intentá de nuevo.'),
                    onFinish: () => setProcessing(false),
                }
            );
        } else if (currentStep === 4) {
            if (!avatarFile) {
                setCurrentStep(5);
                return;
            }

            const formData = new FormData();
            formData.append('avatar', avatarFile);
            setProcessing(true);
            router.post('/onboarding/step-3', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setCurrentStep(5),
                onError: () => toast.error('No pudimos subir tu foto. Revisá tu conexión e intentá de nuevo.'),
                onFinish: () => setProcessing(false),
            });
        } else if (currentStep === 5) {
            setProcessing(true);
            router.post(
                '/onboarding/step-4',
                { join_requests: selectedProjects },
                {
                    preserveScroll: true,
                    onError: () => toast.error('No pudimos guardar tu selección. Revisá tu conexión e intentá de nuevo.'),
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    const handleBack = () => {
        if (processing) return;
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const requestSkip = () => {
        if (processing) return;
        setConfirmingSkip(true);
    };

    const confirmSkip = () => {
        if (processing) return;
        setProcessing(true);
        setConfirmingSkip(false);
        router.post('/onboarding/skip', {}, {
            preserveScroll: true,
            onError: () => {
                setProcessing(false);
                toast.error('No pudimos finalizar el onboarding. Revisá tu conexión e intentá de nuevo.');
            },
            onFinish: () => setProcessing(false),
        });
    };

    const cancelSkip = () => {
        if (processing) return;
        setConfirmingSkip(false);
    };

    const stepErrors = (prefix: string) =>
        Object.entries(errors).filter(
            ([key]) => key === prefix || key.startsWith(`${prefix}.`)
        );

    const techsErrorId = 'techs-error';
    const joinRequestsErrorId = 'join-requests-error';
    const techsError = stepErrors('techs')[0]?.[1];
    const joinRequestsError = stepErrors('join_requests')[0]?.[1];

    return (
        <>
            <Seo title="Configurá tu perfil inicial" description="Completá lo mínimo para que otros developers entiendan tu stack, tu nivel y qué tipo de proyectos querés construir." />
            <OnboardingLayout currentStep={currentStep} totalSteps={totalSteps} onSkipRequest={requestSkip}>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentStep === 1 && 'Elegí tu stack principal'}
                            {currentStep === 2 && 'Contá qué querés construir'}
                            {currentStep === 3 && 'Sumá tus links profesionales'}
                            {currentStep === 4 && 'Agregá una foto si querés'}
                            {currentStep === 5 && 'Elegí proyectos para explorar'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && `Este es el único paso obligatorio: elegí hasta ${MAX_SELECTED_TECHS} tecnologías que mejor te representen.`}
                            {currentStep === 2 && 'Opcional: una frase clara alcanza para que otros entiendan tu objetivo.'}
                            {currentStep === 3 && 'Opcional: GitHub o LinkedIn ayudan a validar tu trabajo sin pedirte más datos.'}
                            {currentStep === 4 && 'Opcional: podés dejarlo para después desde tu perfil.'}
                            {currentStep === 5 && 'Opcional: marcá proyectos que te interesen o finalizá ahora.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Tech Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {techsError && <FormError id={techsErrorId} message={techsError} />}

                                <p className="text-sm text-muted-foreground">
                                    {selectedTechs.length} de {MAX_SELECTED_TECHS} elegidas
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {allTechs.map((tech) => {
                                        const isSelected = selectedTechs.some((t) => t.id === tech.id);
                                        const atCap = !isSelected && selectedTechs.length >= MAX_SELECTED_TECHS;
                                        return (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => toggleTech(tech)}
                                                aria-pressed={isSelected}
                                                aria-invalid={Boolean(techsError)}
                                                aria-describedby={techsError ? techsErrorId : undefined}
                                                disabled={atCap}
                                                className={`p-3 rounded-lg border text-left transition-colors ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : atCap
                                                          ? 'border-border opacity-50 cursor-not-allowed'
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
                                            Nivel actual en cada tecnología
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Usamos este dato para mostrarte proyectos acordes a tu momento, no para excluirte.
                                        </p>
                                        {selectedTechs.map((tech) => (
                                            <div
                                                key={tech.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border"
                                            >
                                                <span className="text-sm text-foreground">
                                                    {tech.name}
                                                </span>
                                                <Field
                                                    id={`tech-${tech.id}-proficiency`}
                                                    label={`${tech.name} nivel de experiencia`}
                                                    labelClassName="sr-only"
                                                >
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
                                                </Field>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Bio */}
                        {currentStep === 2 && (
                            <div className="space-y-3">
                                <Field id="bio" label="Objetivo o bio breve" error={errors.bio}>
                                    <Textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        maxLength={1000}
                                        placeholder="Ej: Quiero practicar React y Laravel construyendo productos reales para mi portfolio."
                                        rows={5}
                                        className="w-full"
                                    />
                                </Field>
                                <p className="text-sm text-muted-foreground">
                                    Si no sabés qué poner ahora, podés avanzar y editarlo después.
                                </p>
                                <div className="text-right text-sm text-muted-foreground">
                                    {bio.length}/1000
                                </div>
                            </div>
                        )}

                        {/* Step 3: Social Links */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                {/* General social links errors */}
                                {errors.links && <FormError id="links-error" message={errors.links} className="mb-2" />}
                                <p className="text-sm text-muted-foreground">
                                    Agregá solo los perfiles que ya tengas listos. GitHub o LinkedIn suelen ser suficientes para empezar.
                                </p>
                                {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => {
                                    const platformIndex = Object.keys(PLATFORM_LABELS).indexOf(platform);
                                    const urlError = errors[`links.${platformIndex}.url`];

                                    return (
                                        <div key={platform} className="flex items-center gap-3">
                                            <div className="text-muted-foreground flex-shrink-0">
                                                {PLATFORM_ICONS[platform]}
                                            </div>
                                            <div className="flex-1">
                                                <Field
                                                    id={`social-${platform}`}
                                                    label={`${PLATFORM_LABELS[platform]} URL`}
                                                    labelClassName="sr-only"
                                                    error={urlError}
                                                >
                                                    <Input
                                                        type="url"
                                                        value={socialLinks[platform] ?? ''}
                                                        onChange={(e) =>
                                                            setSocialLinks((prev) => ({
                                                                ...prev,
                                                                [platform]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder={`https://...`}
                                                        aria-invalid={Boolean(urlError || errors.links)}
                                                        aria-describedby={errors.links ? 'links-error' : undefined}
                                                    />
                                                </Field>
                                            </div>
                                            <span className="text-sm text-muted-foreground w-24 flex-shrink-0">
                                                {PLATFORM_LABELS[platform]}
                                            </span>
                                        </div>
                                    );
                                })}

                                {/* Preview */}
                                {Object.values(socialLinks).some((url) => (url ?? '').trim() !== '') && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.keys(socialLinks) as Platform[])
                                                .filter((p) => (socialLinks[p] ?? '').trim() !== '')
                                                .map((platform) => (
                                                    <a
                                                        key={platform}
                                                        href={socialLinks[platform] ?? '#'}
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
                                                src={avatarUrl(user.avatar) ?? ''}
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
                                        <Field id="avatar" label="Avatar" labelClassName="sr-only" error={errors.avatar}>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setAvatarFile(file);
                                                }}
                                                className="text-sm text-muted-foreground"
                                            />
                                        </Field>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Máximo 2MB. Este paso es opcional.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Recommendations */}
                        {currentStep === 5 && (
                            <div className="space-y-4">
                                {joinRequestsError && <FormError id={joinRequestsErrorId} message={joinRequestsError} />}
                                {loadingRecommendations ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Cargando proyectos recomendados...
                                    </div>
                                ) : loadRecommendationsError ? (
                                    <div className="text-center py-8 space-y-3">
                                        <p className="text-muted-foreground">
                                            No pudimos cargar las recomendaciones. Revisá tu conexión.
                                        </p>
                                        <Button type="button" variant="outline" onClick={retryRecommendations}>
                                            Reintentar
                                        </Button>
                                    </div>
                                ) : recommendations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay proyectos recomendados por ahora. Podés finalizar y explorar más tarde.
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
                                        onCheckedChange={() => toggleProject(project.id)}
                                        className="mt-1"
                                        aria-invalid={Boolean(joinRequestsError)}
                                        aria-describedby={joinRequestsError ? joinRequestsErrorId : undefined}
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
                                disabled={currentStep === 1 || processing}
                            >
                                Atrás
                            </Button>

                            <Button onClick={handleNext} disabled={processing}>
                                {processing
                                    ? 'Guardando...'
                                    : currentStep === 5
                                      ? 'Finalizar'
                                      : 'Siguiente'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={confirmingSkip} onOpenChange={setConfirmingSkip}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>¿Finalizar el onboarding ahora?</DialogTitle>
                            <DialogDescription>
                                Vas a salir del wizard y tu perfil quedará marcado como completo. Si más adelante querés volver, tendrás que pedirle a un administrador que lo reinicie.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={cancelSkip} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmSkip} disabled={processing}>
                                Sí, finalizar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </OnboardingLayout>
        </>
    );
}
