import { Card } from '@/components/ui/card';
import { Project, UserProject } from '@/types';
import { cn } from '@/lib/utils';
import { getProjectCardViewModel, ProjectCardViewModel } from '@/lib/get-project-card-model';
import { ProjectCardImage, ProjectCardBody, ProjectCardHeader, ProjectCardFooter } from './';

interface ProjectCardProps {
    project: Project | UserProject;
    variant?: 'default' | 'featured' | 'compact';
    showParticipatingCount?: boolean;
}

export function ProjectCard({
    project,
    variant = 'default',
    showParticipatingCount = false,
}: ProjectCardProps) {
    const cardModel = getProjectCardViewModel(project, variant, showParticipatingCount);

    function getCardClassName(card: ProjectCardViewModel) {
        return cn(
            'p-0 group/card flex flex-col transition-all duration-200',
            'hover:shadow-lg hover:scale-[1.01]',
            card.isFeatured && 'ring-2 ring-primary/20 shadow-xl hover:shadow-xl',
        );
    }

    return (
        <Card className={getCardClassName(cardModel)}>
            <ProjectCardImage card={cardModel} />
            <ProjectCardHeader card={cardModel} />
            <ProjectCardBody card={cardModel} />
            <ProjectCardFooter card={cardModel} />
        </Card>
    );
}
