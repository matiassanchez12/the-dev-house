import Seo from '@/components/seo';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { UserCard } from '@/components/user/user-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { DiscoverableUser, Tech } from '@/types';

interface Props {
    users: {
        data: DiscoverableUser[];
        links: any;
        meta: any;
    };
    techs: Tech[];
    filters: {
        q?: string;
        tech?: string;
    };
}

export default function Index({ users, techs, filters }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedTech, setSelectedTech] = useState(filters.tech || '');

    const hasActiveFilters = search || selectedTech;

    const handleFilter = () => {
        router.get(
            '/users',
            {
                q: search || null,
                tech: selectedTech || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedTech('');
        router.get('/users');
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {
                q: search || null,
                tech: selectedTech || null,
            });
        }
    };

    return (
        <>
            <Seo title="Developers" description="Encontrá desarrolladores en The Dev House. Buscá por nombre o filtrá por tecnología para conectar con colaboradores." />
            <AppLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-foreground">
                        Developers
                    </h2>
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
                                        Filtrar developers
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Buscá por nombre o filtrá por tecnología
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
                                                placeholder="Nombre del developer..."
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Tecnología
                                        </label>
                                        <Select value={selectedTech} onValueChange={(val) => {
                                                setSelectedTech(val);
                                                handleFilter();
                                            }}>
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

                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={clearFilters}>
                                            <X className="size-4" />
                                            Limpiar
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resultados info */}
                        {hasActiveFilters && (
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {users.meta?.total || users.data.length} resultado{users.data.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        <Separator className="mb-6" />

                        {/* Lista de usuarios */}
                        {users.data.length === 0 ? (
                            <Empty className="py-16">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Search className="size-5 text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {hasActiveFilters
                                            ? 'No se encontraron developers'
                                            : 'No hay developers aún'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {hasActiveFilters
                                            ? 'Probá ajustando los filtros de búsqueda'
                                            : '¡Sé el primero en registrarte!'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                {hasActiveFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Limpiar filtros
                                    </Button>
                                ) : (
                                    <Link href={route('register')}>
                                        <Button>Crear Cuenta</Button>
                                    </Link>
                                )}
                            </Empty>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {users.data.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>

                                {users.meta?.last_page > 1 && (
                                    <div className="mt-8">
                                        {users.links && users.links.length > 0 && (
                                            <Pagination>
                                                <PaginationContent>
                                                    {users.links.map((link: any, index: number) => {
                                                        const isPrev = link.label.includes('&laquo;');
                                                        const isNext = link.label.includes('&raquo;');
                                                        return (
                                                            <PaginationItem key={index}>
                                                                <Button
                                                                    variant={link.active ? 'default' : 'outline'}
                                                                    disabled={!link.url}
                                                                    size="sm"
                                                                    onClick={() => link.url && router.get(link.url)}
                                                                >
                                                                    {isPrev ? 'Anterior' : isNext ? 'Siguiente' : link.label}
                                                                </Button>
                                                            </PaginationItem>
                                                        );
                                                    })}
                                                </PaginationContent>
                                            </Pagination>
                                        )}
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