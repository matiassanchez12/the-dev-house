import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tech, Project as ProjectType } from '@/types';
import { CircleDot, CheckCircle, CircleX } from 'lucide-react';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    projects: {
        data: ProjectType[];
        links: any;
        meta: any;
    };
    techs: Tech[];
    filters: {
        tech?: string;
        status?: string;
    };
}

export default function Index({ auth, projects, techs, filters }: Props) {
    const [selectedTech, setSelectedTech] = useState(filters.tech || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/projects', {
            tech: selectedTech || null,
            status: selectedStatus || null,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSelectedTech('');
        setSelectedStatus('');
        router.get('/projects');
    };

    return (
        <>
            <Head title="Proyectos" />
            <PublicLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-foreground leading-tight">
                            Projects
                        </h2>
                        {auth.user && (
                            <Link href={route('projects.create')}>
                                <Button>Crear Proyecto</Button>
                            </Link>
                        )}
                    </div>
                }
            >
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Filtros */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Filtrar proyectos</CardTitle>
                                <CardDescription>
                                    Encontrá proyectos por tecnología o estado
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-sm font-medium mb-2 block">
                                            Tecnología
                                        </label>
                                        <select
                                            value={selectedTech}
                                            onChange={(e) => setSelectedTech(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Todas</option>
                                            {techs.map((tech) => (
                                                <option key={tech.id} value={tech.slug}>
                                                    {tech.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-sm font-medium mb-2 block">
                                            Estado
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Todos</option>
                                            <option value="open">Abierto</option>
                                            <option value="closed">Cerrado</option>
                                            <option value="completed">Completado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <Button onClick={handleFilter}>
                                            Filtrar
                                        </Button>
                                        <Button variant="outline" onClick={clearFilters}>
                                            Limpiar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de proyectos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.data.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-muted-foreground text-lg">
                                        No hay proyectos aún. ¡Sé el primero en crear uno!
                                    </p>
                                </div>
                            ) : (
                                projects.data.map((project) => (
                                    <Card key={project.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                <Link
                                                    href={route('projects.show', project.slug)}
                                                    className="hover:text-primary transition"
                                                >
                                                    {project.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {project.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            {/* Techs */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {project.techs?.slice(0, 5).map((tech) => (
                                                    <Badge key={tech.id} variant="secondary">
                                                        {tech.name}
                                                    </Badge>
                                                ))}
                                                {project.techs && project.techs.length > 5 && (
                                                    <Badge variant="outline">
                                                        +{project.techs.length - 5}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Creator */}
                                            <div className="text-sm text-muted-foreground">
                                                Por: {project.creator?.name}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Badge
                                                variant={
                                                    project.status === 'open'
                                                        ? 'secondary'
                                                        : project.status === 'completed'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className={
                                                    project.status === 'open'
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                                        : project.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : ''
                                                }
                                            >
                                                {project.status === 'open' && (
                                                    <CircleDot className="h-3 w-3" />
                                                )}
                                                {project.status === 'completed' && (
                                                    <CheckCircle className="h-3 w-3" />
                                                )}
                                                {project.status === 'closed' && (
                                                    <CircleX className="h-3 w-3" />
                                                )}
                                                {project.status === 'open'
                                                    ? 'Abierto'
                                                    : project.status === 'completed'
                                                    ? 'Completado'
                                                    : 'Cerrado'}
                                            </Badge>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Paginación */}
                        {projects.data.length > 0 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {projects.links.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
