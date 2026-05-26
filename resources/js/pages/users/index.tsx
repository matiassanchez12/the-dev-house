import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { UserCard } from '@/components/user/user-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

    return (
        <>
            <Head title="Discover Users" />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Discover Developers
                        </h1>
                        <p className="text-muted-foreground">
                            Find and connect with developers who share your interests
                        </p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Filter Users</CardTitle>
                            <CardDescription>
                                Search by name or filter by technology
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <label htmlFor="search" className="text-sm font-medium mb-2 block">
                                        Search
                                    </label>
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label htmlFor="tech-filter" className="text-sm font-medium mb-2 block">
                                        Technology
                                    </label>
                                    <select
                                        id="tech-filter"
                                        value={selectedTech}
                                        onChange={(e) => handleTechChange(e.target.value)}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">All Technologies</option>
                                        {techs.map((tech) => (
                                            <option key={tech.id} value={tech.slug}>
                                                {tech.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {users.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-16">
                                <div className="text-center">
                                    <p className="text-lg text-muted-foreground mb-4">
                                        No users found
                                    </p>
                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {users.data.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {users.data.length > 0 && (
                                <div className="flex justify-center gap-2">
                                    {users.links.map((link: any, index: number) => (
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
}