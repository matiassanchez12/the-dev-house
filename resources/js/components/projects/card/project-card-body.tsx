import { CardContent } from "@/components/ui/card";
import { ProjectCardViewModel } from "@/lib/get-project-card-model";
import { cn } from "@/lib/utils";
import { ProjectCardTechs, CompactProjectDescription, ProjectCardCreator, ProjectCardParticipants } from "./shared";

interface ProjectCardSectionProps {
    card: ProjectCardViewModel;
}
    
export function ProjectCardBody({ card }: ProjectCardSectionProps) {
    return (
        <CardContent className={cn('flex-1', card.isCompact && 'pt-0')}>
            <ProjectCardTechs card={card} />
            <CompactProjectDescription card={card} />
            <ProjectCardCreator card={card} />
            <ProjectCardParticipants card={card} />
        </CardContent>
    );
}
