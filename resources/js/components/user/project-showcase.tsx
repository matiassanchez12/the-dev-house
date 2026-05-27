import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ProjectCard } from '@/components/projects/project-card';
import { UserProject } from '@/types';
import { FolderOpen, Users } from 'lucide-react';

interface ProjectShowcaseProps {
    createdProjects: UserProject[];
    participatingProjects: UserProject[];
}

function EmptyProjects({ message }: { message: string }) {
    return (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderOpen className="size-5 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>{message}</EmptyTitle>
                <EmptyDescription>
                    Los proyectos aparecerán aquí cuando estén disponibles.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

export function ProjectShowcase({ createdProjects, participatingProjects }: ProjectShowcaseProps) {
    const hasCreated = createdProjects.length > 0;
    const hasParticipating = participatingProjects.length > 0;
    const showTabs = hasCreated && hasParticipating;

    if (!hasCreated && !hasParticipating) {
        return <EmptyProjects message="No hay proyectos para mostrar" />;
    }

    if (!showTabs) {
        const projects = hasCreated ? createdProjects : participatingProjects;
        return (
            <div className="flex flex-col gap-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        variant="compact"
                    />
                ))}
            </div>
        );
    }

    return (
        <Tabs defaultValue="created">
            <TabsList variant="line" className="mb-4">
                <TabsTrigger value="created">
                    Creados ({createdProjects.length})
                </TabsTrigger>
                <TabsTrigger value="participating">
                    Participando ({participatingProjects.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="created">
                <div className="flex flex-col gap-4">
                    {hasCreated ? (
                        createdProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                variant="compact"
                            />
                        ))
                    ) : (
                        <EmptyProjects message="No ha creado proyectos todavía" />
                    )}
                </div>
            </TabsContent>

            <TabsContent value="participating">
                <div className="flex flex-col gap-4">
                    {hasParticipating ? (
                        participatingProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                variant="compact"
                            />
                        ))
                    ) : (
                        <EmptyProjects message="No participa en proyectos todavía" />
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
}
