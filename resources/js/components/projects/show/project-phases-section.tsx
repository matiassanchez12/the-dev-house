import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import type { Phase } from '@/types';
import { ProjectPhaseForm } from './project-phase-form';
import { ProjectPhaseItem } from './project-phase-item';

interface ProjectPhasesSectionProps {
    projectSlug: string;
    phases?: Phase[];
    isCreator: boolean;
}

export function ProjectPhasesSection({ projectSlug, phases = [], isCreator }: ProjectPhasesSectionProps) {
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

            {isCreator && <ProjectPhaseForm projectSlug={projectSlug} />}

            {isCreator && phases.length > 0 && <Separator />}

            <div className="flex flex-col gap-4">
                {phases.length === 0 ? (
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
                    phases.map((phase) => (
                        <ProjectPhaseItem
                            key={phase.id}
                            phase={phase}
                            projectSlug={projectSlug}
                            isCreator={isCreator}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
