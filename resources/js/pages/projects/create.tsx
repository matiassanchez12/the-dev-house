import { useCallback, useEffect, useRef, useState } from 'react';
import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectIdea, Tech } from '@/types';
import { ProjectForm } from '@/components/projects/project-form';
import { ProjectIdeaInspiration } from '@/components/projects/project-idea-inspiration';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    techs: Tech[];
    projectIdeas?: ProjectIdea[];
}

export default function Create({ auth, techs, projectIdeas = [] }: Props) {
    const form = useForm({
        title: '',
        description: '',
        vision: '',
        techs: [] as number[],
        repository_url: '',
        demo_url: '',
        images: [] as File[],
    });

    const { data, setData } = form;

    const [announcement, setAnnouncement] = useState('');
    const deepLinkSeededRef = useRef(false);

    // Latest form data for the on-mount deep-link effect without re-subscribing it.
    const dataRef = useRef(data);
    dataRef.current = data;

    const applyIdea = useCallback(
        (idea: ProjectIdea) => {
            setData('title', idea.prefillTitle);
            setData('description', idea.prefillDescription);
            setData('vision', idea.prefillVision);
            setData('techs', idea.techIds);
        },
        [setData],
    );

    const handleSelectIdea = useCallback(
        (idea: ProjectIdea) => {
            applyIdea(idea);

            const url = `${window.location.pathname}?idea=${idea.slug}`;
            window.history.replaceState('', '', url);

            document.getElementById('title')?.focus();
            setAnnouncement(`Formulario prellenado con la idea: ${idea.title}`);
        },
        [applyIdea],
    );

    useEffect(() => {
        if (deepLinkSeededRef.current) {
            return;
        }

        deepLinkSeededRef.current = true;

        const slug = new URLSearchParams(window.location.search).get('idea');

        if (!slug) {
            return;
        }

        const idea = projectIdeas.find((candidate) => candidate.slug === slug);

        if (!idea) {
            return;
        }

        const current = dataRef.current;

        if (current.title === '') {
            setData('title', idea.prefillTitle);
        }

        if (current.description === '') {
            setData('description', idea.prefillDescription);
        }

        if (current.vision === '') {
            setData('vision', idea.prefillVision);
        }

        if (current.techs.length === 0) {
            setData('techs', idea.techIds);
        }

        setAnnouncement(`Formulario prellenado con la idea: ${idea.title}`);
        // Runs once on mount only: deep-link prefill must never re-run on re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/projects', {
            forceFormData: true,
            onSuccess: () => toast.success('Proyecto creado exitosamente'),
            onError: () => toast.error('Error al crear el proyecto'),
        });
    };

    return (
        <>
            <Seo title="Crear Proyecto" description="Publicá tu proyecto en The Dev House. Definí tecnologías, objetivos y encontrá colaboradores para construir software juntos." />
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        Crear Nuevo Proyecto
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 flex flex-col gap-6">
                        <p className="sr-only" role="status" aria-live="polite">
                            {announcement}
                        </p>

                        <ProjectIdeaInspiration
                            ideas={projectIdeas}
                            techs={techs}
                            onSelect={handleSelectIdea}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Proyecto</CardTitle>
                                <CardDescription>
                                    Compartí los detalles de tu proyecto para atraer colaboradores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProjectForm
                                    mode="create"
                                    techs={techs}
                                    form={form}
                                    onSubmit={handleSubmit}
                                    cancelUrl={route('projects.index')}
                                    submitLabel="Crear Proyecto"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
