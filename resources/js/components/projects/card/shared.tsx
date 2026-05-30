import { ProjectCardViewModel } from "@/lib/get-project-card-model";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, Users } from "lucide-react";
import { getInitials, relativeDate } from "../project-utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@inertiajs/react";
import { ProjectStatusBadge } from "../project-status-badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProjectCardSectionProps {
    card: ProjectCardViewModel;
}

export function ProjectCardTechs({ card }: ProjectCardSectionProps) {
    if (card.displayTechs.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap', card.isCompact ? 'gap-1 mb-2' : 'gap-1.5 mb-3')}>
            {card.displayTechs.map((tech) => (
                <Badge
                    key={tech.id}
                    variant="secondary"
                    className={cn(
                        card.isCompact
                            ? 'text-[10px] px-1.5 py-0.5'
                            : 'text-xs hover:bg-primary/10 transition-colors cursor-pointer',
                    )}
                >
                    {tech.name}
                </Badge>
            ))}

            {card.overflowCount > 0 && (
                <Badge
                    variant="outline"
                    className={cn(card.isCompact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs')}
                >
                    +{card.overflowCount}
                </Badge>
            )}
        </div>
    );
}

export function CompactProjectDescription({ card }: ProjectCardSectionProps) {
    if (!card.isCompact || !card.description) {
        return null;
    }

    return <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{card.description}</p>;
}

export function ProjectCardCreator({ card }: ProjectCardSectionProps) {
    if (!card.showCreator || !card.creator) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Avatar size="sm">
                <AvatarImage src={card.creator.avatar ?? undefined} />
                <AvatarFallback>{getInitials(card.creator.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Por: {card.creator.name}</span>
        </div>
    );
}

export function ProjectCardParticipants({ card }: ProjectCardSectionProps) {
    const participantsCount = card.participantsCount ?? 0;

    if (!card.showParticipants || participantsCount === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>{participantsCount} participante{participantsCount !== 1 ? 's' : ''}</span>
        </div>
    );
}

export function CompactProjectCardMeta({ card }: ProjectCardSectionProps) {
    return (
        <div className="flex items-center gap-3">
            <ProjectStatusBadge status={card.status} />
            {card.createdAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    <span>{format(new Date(card.createdAt), 'd MMM yyyy', { locale: es })}</span>
                </div>
            )}
        </div>
    );
}

export function DefaultProjectCardMeta({ card }: ProjectCardSectionProps) {
    const participantsCount = card.participantsCount ?? 0;

    return (
        <>
            <ProjectStatusBadge status={card.status} />

            {participantsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>{participantsCount}</span>
                </div>
            )}

            {card.createdAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{relativeDate(card.createdAt)}</span>
                </div>
            )}
        </>
    );
}

export function ProjectTitleLink({ slug, children }: { slug: string; children: React.ReactNode }) {
    return (
        <Link href={route('projects.show', slug)} className="hover:text-primary transition-colors">
            {children}
        </Link>
    );
}

export function ProjectCardLink({ slug, children }: { slug: string; children: React.ReactNode }) {
    return (
        <Link href={route('projects.show', slug)} className="block">
            {children}
        </Link>
    );
}

export function CompactProjectCardImage({ card }: ProjectCardSectionProps) {
    if (!card.imageUrl) {
        return <GradientFallback className="h-20 bg-gradient-to-r rounded-t-lg" gradient={card.gradientFallback} />;
    }

    return (
        <ProjectCardLink slug={card.slug}>
            <div className="relative h-32 overflow-hidden rounded-t-lg">
                <ProjectImage src={card.imageUrl} alt={card.title} />
                <div className={cn('absolute inset-0 bg-gradient-to-t opacity-60', card.gradientFallback)} />
            </div>
        </ProjectCardLink>
    );
}

export function ProjectImage({ src, alt }: { src: string; alt: string }) {
    return (
        <img
            src={src}
            alt={alt}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
    );
}

export function GradientFallback({ className, gradient }: { className: string; gradient: string }) {
    return <div className={cn(className, gradient)} />;
}