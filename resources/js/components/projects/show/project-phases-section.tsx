import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { Phase } from '@/types';
import { ProjectPhaseForm } from './project-phase-form';
import { ProjectPhaseItem } from './project-phase-item';

type ProjectViewerRole = 'guest' | 'creator' | 'member';

interface ProjectPhasesSectionProps {
    projectSlug: string;
    phases?: Phase[];
    viewerRole?: ProjectViewerRole;
    isCreator?: boolean;
}

export function ProjectPhasesSection({
    projectSlug,
    phases = [],
    viewerRole,
    isCreator,
}: ProjectPhasesSectionProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const resolvedViewerRole = viewerRole ?? (isCreator ? 'creator' : 'guest');
    const canManage = resolvedViewerRole === 'creator';

    if (resolvedViewerRole === 'guest' && phases.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-4 rounded-none border border-border/60 bg-card/30 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
                        Logros
                        <Badge variant="secondary">{phases.length}</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Seguimiento de avances y entregables cerrados
                    </p>
                </div>
            </div>

            <Separator />

            {canManage && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Plus className="size-4" data-icon="inline-start" />
                            Registrar logro
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>Registrar logro</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                            <ProjectPhaseForm
                                projectSlug={projectSlug}
                                onSuccess={() => setIsSheetOpen(false)}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {canManage && phases.length > 0 && <Separator />}

            <div className="flex flex-col gap-4">
                {phases.length === 0 ? (
                    resolvedViewerRole === 'creator' ? (
                        <Empty className="border-border/60 bg-background/50">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Sparkles />
                                </EmptyMedia>
                                <EmptyTitle>Todavía no registraste logros</EmptyTitle>
                                <EmptyDescription>
                                    Cuando cierres un logro, va a aparecer acá.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent />
                        </Empty>
                    ) : (
                        <Empty className="border-border/60 bg-background/50">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Sparkles />
                                </EmptyMedia>
                                <EmptyTitle>Aún no hay hitos disponibles</EmptyTitle>
                                <EmptyDescription>
                                    Tu líder todavía no creó ningún hito u objetivo.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent />
                        </Empty>
                    )
                ) : (
                    phases.map((phase) => (
                        <ProjectPhaseItem
                            key={phase.id}
                            phase={phase}
                            projectSlug={projectSlug}
                            canManage={canManage}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
