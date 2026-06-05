import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tech, Project as ProjectType } from '@/types';
import { ProjectForm } from '@/components/projects/project-form';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    project: ProjectType & {
        techs: Tech[];
    };
    techs: Tech[];
}

export default function Edit({ auth, project, techs }: Props) {
    const form = useForm({
        _method: 'put',
        title: project.title,
        description: project.description,
        vision: project.vision ?? '',
        techs: project.techs.map((t) => t.id) as number[],
        repository_url: project.repository_url ?? '',
        demo_url: project.demo_url ?? '',
        images: [] as File[],
        remove_images: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(`/projects/${project.slug}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Proyecto actualizado exitosamente');
                form.reset('images', 'remove_images');
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors);
                if (errorMessages.length > 0) {
                    toast.error(errorMessages[0] as string);
                } else {
                    toast.error('Error al actualizar el proyecto');
                }
            },
        });
    };

    return (
        <>
            <Seo title={`Editar ${project.title}`} description="Actualizá la información de tu proyecto en The Dev House." />
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        Editar Proyecto
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Proyecto</CardTitle>
                                <CardDescription>
                                    Actualizá los detalles de tu proyecto
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProjectForm
                                    mode="edit"
                                    project={project}
                                    techs={techs}
                                    form={form}
                                    onSubmit={handleSubmit}
                                    cancelUrl={route('projects.show', project.slug)}
                                    submitLabel="Guardar Cambios"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
