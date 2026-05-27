import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import PublicLayout from '@/layouts/public';
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
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Search, X } from 'lucide-react';
import { DiscoverableUser, Tech } from '@/types';

interface Props {
    users: {
        data: DiscoverableUser[];
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
        q?: string;
        tech?: string;
    };
}

export default function Index({ users, techs, filters }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedTech, setSelectedTech] = useState(filters.tech || '');
    const [isDebouncing, setIsDebouncing] = useState(false);

    // Debounced search
    useEffect(() => {
        if (search === filters.q) return;

        setIsDebouncing(true);
        const timer = setTimeout(() => {
            setIsDebouncing(false);
            router.get('/users', {
                q: search || null,
                tech: selectedTech || null,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleTechChange = useCallback((techSlug: string) => {
        setSelectedTech(techSlug);
        router.get('/users', {
            q: search || null,
            tech: techSlug || null,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [search]);

    const clearFilters = () => {
        setSearch('');
        setSelectedTech('');
        router.get('/users');
    };

    const hasActiveFilters = search || selectedTech;

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {
                q: search || null,
                tech: selectedTech || null,
            });
        }
    };

    const renderPagination = () => {
        const { current_page, last_page } = users.meta;
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
                            onClick={() => handlePageChange(users.links.find((l) => l.label.includes('&laquo;'))?.url ?? null)}
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
                                        const link = users.links.find(
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
                            onClick={() => handlePageChange(users.links.find((l) => l.label.includes('&raquo;'))?.url ?? null)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Head title="Discover Developers" />
            <PublicLayout
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            Developers
                        </h2>
                    </div>
                }
            >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Filters */}
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Search className="size-4 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Filter developers
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Search by name or filter by technology
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search by name..."
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium">
                                            Technology
                                        </label>
                                        <Select value={selectedTech} onValueChange={handleTechChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Technologies" />
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

                                    <div className="flex gap-2">
                                        {hasActiveFilters && (
                                            <Button variant="outline" onClick={clearFilters}>
                                                <X className="size-4" />
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results info */}
                        {hasActiveFilters && (
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {users.meta.total} result{users.meta.total !== 1 ? 's' : ''}
                                    {users.meta.total > 0 && ` (${users.meta.from}-${users.meta.to} of ${users.meta.total})`}
                                </p>
                            </div>
                        )}

                        <Separator className="mb-6" />

                        {/* Results */}
                        {users.data.length === 0 ? (
                            <Empty className="py-16">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Search className="size-5 text-muted-foreground" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {hasActiveFilters
                                            ? 'No developers found'
                                            : 'No developers yet'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {hasActiveFilters
                                            ? 'Try adjusting your search filters'
                                            : 'Be the first to join!'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear filters
                                    </Button>
                                )}
                            </Empty>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {users.data.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>

                                {users.meta.last_page > 1 && (
                                    <div className="mt-8">
                                        {renderPagination()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
