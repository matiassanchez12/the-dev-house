import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProject } from '@/types';
import { CircleDot, CheckCircle, CircleX, Users } from 'lucide-react';

interface ProjectShowcaseProps {
    createdProjects: UserProject[];
    participatingProjects: UserProject[];
}

const statusConfig = {
    open: { label: 'Abierto', icon: CircleDot, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    completed: { label: 'Completado', icon: CheckCircle, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    closed: { label: 'Cerrado', icon: CircleX, className: '' },
};

function ProjectCard({ project }: { project: UserProject }) {
    const config = statusConfig[project.status];
    const StatusIcon = config.icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">
                        <Link
                            href={route('projects.show', project.slug)}
                            className="hover:underline"
                        >
                            {project.title}
                        </Link>
                    </CardTitle>
                    <Badge variant="secondary" className={config.className}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {project.techs.map((tech) => (
                        <Badge key={tech.id} variant="outline">
                            {tech.name}
                        </Badge>
                    ))}
                </div>
                <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.participants_count} participante{project.participants_count !== 1 ? 's' : ''}</span>
                </div>
            </CardContent>
        </Card>
    );
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

    // Show participating tab only if user has participating projects
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
                            <ProjectCard key={project.id} project={project} />
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
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <EmptyState message="No participa en proyectos todavía" />
                    )}
                </div>
            )}
        </div>
    );
}
