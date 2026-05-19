import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tech } from '@/types';

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
    const { data, setData, post, processing, errors } = useForm({
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
        post('/projects', {
            forceFormData: true,
            onSuccess: () => {
                // Reset form on success
            },
        });
    };

    const handleTechChange = (techId: number, checked: boolean) => {
        if (checked) {
            setData('techs', [...data.techs, techId]);
        } else {
            setData('techs', data.techs.filter((id) => id !== techId));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
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
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Título */}
                                    <div>
                                        <Label htmlFor="title">Título *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Ej: Plataforma de E-commerce"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <Label htmlFor="description">Descripción *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describí de qué trata tu proyecto..."
                                            rows={4}
                                            required
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Visión */}
                                    <div>
                                        <Label htmlFor="vision">Visión del Proyecto (opcional)</Label>
                                        <Textarea
                                            id="vision"
                                            value={data.vision}
                                            onChange={(e) => setData('vision', e.target.value)}
                                            placeholder="¿Qué querés lograr con este proyecto a largo plazo?"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Tech Stack */}
                                    <div>
                                        <Label>Tecnologías Requeridas *</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                            {techs.map((tech) => (
                                                <label
                                                    key={tech.id}
                                                    className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-muted"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.techs.includes(tech.id)}
                                                        onChange={(e) => handleTechChange(tech.id, e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{tech.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.techs && (
                                            <p className="text-red-500 text-sm mt-1">{errors.techs}</p>
                                        )}
                                    </div>

                                    {/* URLs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="repository_url">Repositorio (opcional)</Label>
                                            <Input
                                                id="repository_url"
                                                type="url"
                                                value={data.repository_url}
                                                onChange={(e) => setData('repository_url', e.target.value)}
                                                placeholder="https://github.com/..."
                                            />
                                            {errors.repository_url && (
                                                <p className="text-red-500 text-sm mt-1">{errors.repository_url}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="demo_url">Demo (opcional)</Label>
                                            <Input
                                                id="demo_url"
                                                type="url"
                                                value={data.demo_url}
                                                onChange={(e) => setData('demo_url', e.target.value)}
                                                placeholder="https://mi-proyecto.com"
                                            />
                                            {errors.demo_url && (
                                                <p className="text-red-500 text-sm mt-1">{errors.demo_url}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Imágenes */}
                                    <div>
                                        <Label htmlFor="images">Imágenes del Proyecto (opcional)</Label>
                                        <Input
                                            id="images"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="mt-2"
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Podés subir múltiples imágenes (max 2MB cada una)
                                        </p>
                                        {errors.images && (
                                            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                                        )}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creando...' : 'Crear Proyecto'}
                                        </Button>
                                        <Link href={route('projects.index')}>
                                            <Button type="button" variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
