import { ProjectCardViewModel } from "@/lib/get-project-card-model";
import { CompactProjectCardImage, ProjectCardLink, ProjectImage, GradientFallback } from "./shared";

interface ProjectCardSectionProps {
    card: ProjectCardViewModel;
}


export function ProjectCardImage({ card }: ProjectCardSectionProps) {
    if (card.isCompact) {
        return <CompactProjectCardImage card={card} />;
    }

    return (
        <ProjectCardLink slug={card.slug}>
            <div className="relative aspect-video overflow-hidden">
                {card.imageUrl ? (
                    <ProjectImage src={card.imageUrl} alt={card.title} />
                ) : (
                    <GradientFallback className="size-full bg-gradient-to-br" gradient={card.gradientFallback} />
                )}
            </div>
        </ProjectCardLink>
    );
}