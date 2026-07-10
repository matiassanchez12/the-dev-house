import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MilestoneCard } from '@/components/public/milestone-card';
import type { Phase, Project } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

type Milestone = Phase & {
    project: Project;
};

interface Props {
    milestones: {
        data: Milestone[];
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
}

export default function Milestones({ milestones }: Props) {
    const handlePageChange = (url: string | null) => {
        if (url) router.get(url);
    };

    const renderPagination = () => {
        const { current_page, last_page } = milestones.meta;
        const pages: (number | 'ellipsis')[] = [];

        for (let i = 1; i <= last_page; i++) {
            if (i === 1 || i === last_page || (i >= current_page - 1 && i <= current_page + 1)) pages.push(i);
            else if (pages[pages.length - 1] !== 'ellipsis') pages.push('ellipsis');
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(milestones.links.find((link) => link.label.includes('&laquo;'))?.url ?? null)} />
                    </PaginationItem>
                    {pages.map((page, index) => page === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink isActive={page === current_page} onClick={() => handlePageChange(milestones.links.find((item) => item.label === String(page))?.url ?? null)}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(milestones.links.find((link) => link.label.includes('&raquo;'))?.url ?? null)} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Seo title="Logros recientes" description="Explorá los hitos más recientes alcanzados por los proyectos de The Dev House." />
            <AppLayout header={<h2 className="text-xl font-semibold leading-tight text-foreground">Logros</h2>}>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                                    <CardTitle className="text-base">Hitos publicados</CardTitle>
                                </div>
                                <CardDescription>Últimos avances cerrados por los proyectos de la comunidad</CardDescription>
                            </CardHeader>
                        </Card>

                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {milestones.meta.total === 1 ? '1 logro encontrado' : `${milestones.meta.total} logros encontrados`}
                            </p>
                        </div>

                        <Separator className="mb-6" />

                        {milestones.data.length === 0 ? (
                            <Empty className="py-16">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon"><Search className="size-5 text-muted-foreground" /></EmptyMedia>
                                    <EmptyTitle>Aún no hay logros públicos</EmptyTitle>
                                    <EmptyDescription>Cuando los proyectos empiecen a cerrar hitos, van a aparecer acá.</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Link href={route('projects.index')}>
                                        <Button variant="outline">Explorar proyectos</Button>
                                    </Link>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <>
                                <div className="flex flex-col gap-6">
                                    {milestones.data.map((milestone) => <MilestoneCard key={milestone.id} milestone={milestone} />)}
                                </div>
                                {milestones.meta.last_page > 1 && <div className="mt-8">{renderPagination()}</div>}
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
