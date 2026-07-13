import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Phase, ProjectViewerRole } from '@/types';
import { ProjectPhaseDrawer } from './project-phase-drawer';
import { ProjectPhaseItem } from './project-phase-item';

interface ProjectPhasesSectionProps {
    projectSlug: string;
    phases?: Phase[];
    viewerRole?: ProjectViewerRole;
}

export function ProjectPhasesSection({ projectSlug, phases = [], viewerRole }: ProjectPhasesSectionProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
    const resolvedViewerRole = viewerRole ?? 'guest';
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
                <Sheet open={isSheetOpen || editingPhase !== null} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) setEditingPhase(null); }}>
                    <SheetTrigger
                        render={
                            <Button variant="outline" className="w-full">
                                <Plus className="size-4" data-icon="inline-start" />
                                Registrar logro
                            </Button>
                        }
                    />
                    <SheetContent side="right" className="w-full sm:max-w-md">
                        <div className="flex h-full flex-col p-4">
                            <SheetHeader className="px-0 pt-0 pb-4">
                                <SheetTitle>{editingPhase ? 'Editar logro' : 'Registrar logro'}</SheetTitle>
                            </SheetHeader>
                            <ProjectPhaseDrawer
                                projectSlug={projectSlug}
                                open={isSheetOpen || editingPhase !== null}
                                onOpenChange={(open) => {
                                    setIsSheetOpen(open);
                                    if (!open) setEditingPhase(null);
                                }}
                                phase={editingPhase}
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
                                <EmptyDescription>Cuando cierres un logro, va a aparecer acá.</EmptyDescription>
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
                                <EmptyDescription>Tu líder todavía no creó ningún hito u objetivo.</EmptyDescription>
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
                            onEdit={() => {
                                setEditingPhase(phase);
                                setIsSheetOpen(true);
                            }}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
