import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectCard } from '@/components/projects/project-card';
import { UserProject } from '@/types';

interface ProjectShowcaseProps {
    createdProjects: UserProject[];
    participatingProjects: UserProject[];
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                {message}
            </CardContent>
        </Card>
    );
}

export function ProjectShowcase({ createdProjects, participatingProjects }: ProjectShowcaseProps) {
    const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

    const hasCreated = createdProjects.length > 0;
    const hasParticipating = participatingProjects.length > 0;

    const showTabs = hasCreated && hasParticipating;

    return (
        <div className="space-y-4">
            {showTabs && (
                <div className="flex gap-4 border-b border-border">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'created'
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Creados ({createdProjects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('participating')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'participating'
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Participando ({participatingProjects.length})
                    </button>
                </div>
            )}

            {activeTab === 'created' && (
                <div className="space-y-4">
                    {hasCreated ? (
                        createdProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                variant="compact"
                            />
                        ))
                    ) : (
                        <EmptyState message="No ha creado proyectos todavía" />
                    )}
                </div>
            )}

            {activeTab === 'participating' && (
                <div className="space-y-4">
                    {hasParticipating ? (
                        participatingProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                variant="compact"
                            />
                        ))
                    ) : (
                        <EmptyState message="No participa en proyectos todavía" />
                    )}
                </div>
            )}
        </div>
    );
}
