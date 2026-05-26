import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tech } from '@/types';
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
    techs: Tech[];
}

export default function Create({ auth, techs }: Props) {
    const form = useForm({
        title: '',
        description: '',
        vision: '',
        techs: [] as number[],
        repository_url: '',
        demo_url: '',
        images: [] as File[],
    });

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
            <Head title="Crear Proyecto" />
            <AuthenticatedLayout
                header={
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        Crear Nuevo Proyecto
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
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
            </AuthenticatedLayout>
        </>
    );
}