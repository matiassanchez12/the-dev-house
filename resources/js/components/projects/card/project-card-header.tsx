import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectCardViewModel } from "@/lib/get-project-card-model";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { ProjectTitleLink } from "./shared";

interface ProjectCardSectionProps {
    card: ProjectCardViewModel;
}

export function ProjectCardHeader({ card }: ProjectCardSectionProps) {
    return (
        <CardHeader className={cn(card.isCompact && 'pb-2')}>
            <div className="flex items-start justify-between gap-2">
                <CardTitle className={cn('leading-tight', card.isCompact ? 'text-base' : 'text-lg')}>
                    <ProjectTitleLink slug={card.slug}>{card.title}</ProjectTitleLink>
                </CardTitle>

                {card.isFeatured && (
                    <Star className="size-5 text-amber-500 shrink-0 mt-1 fill-amber-500" />
                )}
            </div>

            {!card.isCompact && (
                <CardDescription className="line-clamp-2">
                    {card.description || card.title}
                </CardDescription>
            )}
        </CardHeader>
    );
}
