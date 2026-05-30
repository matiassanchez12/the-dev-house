import { CardFooter } from "@/components/ui/card";
import { ProjectCardViewModel } from "@/lib/get-project-card-model";
import { cn } from "@/lib/utils";
import { CompactProjectCardMeta, DefaultProjectCardMeta } from "./shared";

interface ProjectCardSectionProps {
    card: ProjectCardViewModel;
}

export function ProjectCardFooter({ card }: ProjectCardSectionProps) {
    return (
        <CardFooter className={cn('flex justify-between items-center gap-2', card.isCompact && 'pb-3')}>
            {card.isCompact ? <CompactProjectCardMeta card={card} /> : <DefaultProjectCardMeta card={card} />}
        </CardFooter>
    );
}
