import Seo from '@/components/seo';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/projects/card/project-card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Tech, Project as ProjectType } from '@/types';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    projects: {
        data: ProjectType[];
        links: { url: string | null; label: string; active: boolean }[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number | null;
            to: number | null;
        };
    };
    techs: Tech[];
    filters: {
        tech?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, projects, techs, filters }: Props) {
    const [selectedTech, setSelectedTech] = useState(filters.tech || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [search, setSearch] = useState(filters.search || '');

    const hasActiveFilters = selectedTech || selectedStatus || search;

    const handleFilter = () => {
        router.get(
            '/projects',
            {
                tech: selectedTech || null,
                status: selectedStatus || null,
                search: search || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const clearFilters = () => {
        setSelectedTech('');
        setSelectedStatus('');
        setSearch('');
        router.get('/projects');
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {
                tech: selectedTech || null,
                status: selectedStatus || null,
                search: search || null,
            });
        }
    };

    const renderPagination = () => {
        const { current_page, last_page } = projects.meta;
        const pages: (number | 'ellipsis')[] = [];

        for (let i = 1; i <= last_page; i++) {
            if (
                i === 1 ||
                i === last_page ||
                (i >= current_page - 1 && i <= current_page + 1)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== 'ellipsis') {
                pages.push('ellipsis');
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageChange(projects.links.find((l) => l.label.includes('&laquo;'))?.url ?? null)}
                        />
                    </PaginationItem>

                    {pages.map((page, index) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === current_page}
                                    onClick={() => {
                                        const link = projects.links.find(
                                            (l) => l.label === String(page)
                                        );
                                        handlePageChange(link?.url ?? null);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageChange(projects.links.find((l) => l.label.includes('&raquo;'))?.url ?? null)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Seo title="Proyectos" description="Explorá proyectos colaborativos en The Dev House. Filtá por tecnología, estado o buscá por nombre para encontrar el equipo ideal." />
            <AppLayout
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            Proyectos
                        </h2>
                        {auth.user && (
                            <Link href={route('projects.create')}>
                                <Button>
                                    Crear Proyecto
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Filtros */}
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Filtrar proyectos
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Encontrá proyectos por tecnología, estado o nombre
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Buscar
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Nombre del proyecto..."
                                                className="pl-9"
                                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Tecnología
                                        </label>
                                        <Select value={selectedTech} onValueChange={setSelectedTech}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {techs.map((tech) => (
                                                    <SelectItem key={tech.id} value={tech.slug}>
                                                        {tech.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Estado
                                        </label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Abierto</SelectItem>
                                                <SelectItem value="closed">Cerrado</SelectItem>
                                                <SelectItem value="completed">Completado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleFilter}>
                                            Filtrar
                                        </Button>
                                        {hasActiveFilters && (
                                            <Button variant="outline" onClick={clearFilters}>
                                                <X className="size-4" />
                                                Limpiar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resultados info */}
                        {hasActiveFilters && (
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {projects.meta.total} resultado{projects.meta.total !== 1 ? 's' : ''}
                                    {projects.meta.total > 0 && ` (${projects.meta.from}-${projects.meta.to} de ${projects.meta.total})`}
                                </p>
                            </div>
                        )}

                        <Separator className="mb-6" />

                        {/* Lista de proyectos */}
                        {projects.data.length === 0 ? (
                            <Empty className="py-16">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Search className="size-5 text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {hasActiveFilters
                                            ? 'No se encontraron proyectos'
                                            : 'No hay proyectos aún'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {hasActiveFilters
                                            ? 'Probá ajustando los filtros de búsqueda'
                                            : '¡Sé el primero en crear uno!'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                {hasActiveFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Limpiar filtros
                                    </Button>
                                ) : (
                                    auth.user && (
                                        <Link href={route('projects.create')}>
                                            <Button>Crear Proyecto</Button>
                                        </Link>
                                    )
                                )}
                            </Empty>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {projects.data.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            variant="default"
                                        />
                                    ))}
                                </div>

                                {projects.meta.last_page > 1 && (
                                    <div className="mt-8">
                                        {renderPagination()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
