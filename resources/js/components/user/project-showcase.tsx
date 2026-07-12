import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ProjectCard } from '@/components/projects/card/project-card'
import { UserProject } from '@/types'
import { FolderOpen, Lock } from 'lucide-react'

interface ProjectShowcaseProps {
    createdProjects: UserProject[]
    participatingProjects: UserProject[]
    showActivity?: boolean
}

export function getProjectShowcaseEmptyState(showActivity?: boolean) {
    if (showActivity === false) {
        return {
            icon: Lock,
            title: 'Actividad oculta',
            description: 'Este perfil mantiene su actividad privada.',
        }
    }

    return {
        icon: FolderOpen,
        title: 'No hay proyectos para mostrar',
        description: 'Los proyectos aparecerán aquí cuando estén disponibles.',
    }
}

function EmptyProjects({ showActivity }: { showActivity?: boolean }) {
    const state = getProjectShowcaseEmptyState(showActivity)
    const Icon = state.icon

    return (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon className="size-5 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>{state.title}</EmptyTitle>
                <EmptyDescription>{state.description}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    )
}

export function ProjectShowcase({
    createdProjects,
    participatingProjects,
    showActivity,
}: ProjectShowcaseProps) {
    const hasCreated = createdProjects.length > 0
    const hasParticipating = participatingProjects.length > 0
    const showTabs = hasCreated && hasParticipating

    if (!hasCreated && !hasParticipating) {
        return <EmptyProjects showActivity={showActivity} />
    }

    if (!showTabs) {
        const projects = hasCreated ? createdProjects : participatingProjects
        return (
            <div className="flex flex-col gap-4">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} variant="compact" />
                ))}
            </div>
        )
    }

    return (
        <Tabs defaultValue="created" className="flex flex-col">
            <TabsList variant="line" className="mb-4">
                <TabsTrigger value="created">Creados ({createdProjects.length})</TabsTrigger>
                <TabsTrigger value="participating">
                    Participando ({participatingProjects.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="created">
                <div className="flex flex-col gap-4">
                    {hasCreated ? (
                        createdProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} variant="compact" />
                        ))
                    ) : (
                        <EmptyProjects showActivity={showActivity} />
                    )}
                </div>
            </TabsContent>

            <TabsContent value="participating">
                <div className="flex flex-col gap-4">
                    {hasParticipating ? (
                        participatingProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} variant="compact" />
                        ))
                    ) : (
                        <EmptyProjects showActivity={showActivity} />
                    )}
                </div>
            </TabsContent>
        </Tabs>
    )
}
