import { Head } from '@inertiajs/react';
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
            email: string;
        } | null;
    };
    project: ProjectType & {
        techs: Tech[];
        images?: string[] | null;
    };
    techs: Tech[];
}

export default function Edit({ auth, project, techs }: Props) {
    const form = useForm({
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
        
        // Ensure techs is properly formatted for FormData
        const formData = new FormData();
        formData.append('title', form.data.title);
        formData.append('description', form.data.description);
        formData.append('vision', form.data.vision);
        formData.append('repository_url', form.data.repository_url);
        formData.append('demo_url', form.data.demo_url);
        
        // Append techs as array with bracket notation
        form.data.techs.forEach((techId) => {
            formData.append('techs[]', techId.toString());
        });
        
        // Append images
        form.data.images.forEach((file) => {
            formData.append('images[]', file);
        });
        
        // Append remove_images
        if (form.data.remove_images && form.data.remove_images.length > 0) {
            form.data.remove_images.forEach((img) => {
                formData.append('remove_images[]', img);
            });
        }
        
        formData.append('_method', 'PUT');
        
        form.post(`/projects/${project.slug}`, formData, {
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
            <Head title={`Editar ${project.title}`} />
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
