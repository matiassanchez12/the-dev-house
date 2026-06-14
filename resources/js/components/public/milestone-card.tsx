import { Link } from '@inertiajs/react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import type { Phase, Project, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Milestone = Phase & {
    project: Project & {
        creator?: User;
    };
};

interface Props {
    milestone: Milestone;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Sin fecha';

    return new Date(value).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function MilestoneCard({ milestone }: Props) {
    return (
        <Card className="border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        {milestone.title}
                    </CardTitle>

                    <Badge variant="outline" className="w-fit">
                        {milestone.completed_at ? `Completado el ${formatDate(milestone.completed_at)}` : 'Publicado'}
                    </Badge>
                </div>

                <CardDescription>
                    Logro de{' '}
                    <Link href={route('projects.show', milestone.project.slug)} className="font-medium text-foreground hover:underline">
                        {milestone.project.title}
                    </Link>
                    {milestone.project.creator?.name ? ` por ${milestone.project.creator.name}` : ''}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {milestone.description ? (
                    <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                        {milestone.description}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">Sin descripción</p>
                )}

                <Badge variant="secondary" className="w-fit">
                    {milestone.project.creator?.name ?? 'Proyecto de la comunidad'}
                </Badge>
            </CardContent>

            <CardFooter className="justify-end border-t border-border/50 bg-muted/20 pt-4">
                <Link href={route('projects.show', milestone.project.slug)}>
                    <Button variant="outline" size="sm">
                        Ver proyecto
                        <ExternalLink className="size-4" data-icon="inline-end" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
