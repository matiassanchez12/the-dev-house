import { Link } from '@inertiajs/react';
import { Star, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Project, UserProject } from '@/types';
import { cn } from '@/lib/utils';
import { getInitials, storageUrl, relativeDate } from './project-utils';
import { ProjectStatusBadge } from './project-status-badge';

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
    const isFeatured = variant === 'featured';
    const isCompact = variant === 'compact';

    const status = project.status;

    // Handle both Project and UserProject types
    const creator = 'creator' in project ? project.creator : null;
    const techs = project.techs ?? [];
    const participantsCount = 'participants_count' in project ? project.participants_count : 0;
    const title = project.title;
    const slug = project.slug;
    const images = 'images' in project ? project.images : null;
    const createdAt = 'created_at' in project ? project.created_at : undefined;

    const firstImage = images && images.length > 0 ? images[0] : null;
    const imageUrl = storageUrl(firstImage);

    // For compact variant, show participants count; for default/featured, show creator
    const showCreator = !isCompact && creator;
    const showParticipants = isCompact || showParticipatingCount;

    const displayTechs = techs.slice(0, 3);
    const overflowCount = techs.length > 3 ? techs.length - 3 : 0;

    const statusColors: Record<string, string> = {
        open: 'from-green-400/20 to-green-600/20',
        in_progress: 'from-blue-400/20 to-blue-600/20',
        completed: 'from-purple-400/20 to-purple-600/20',
        closed: 'from-gray-400/20 to-gray-600/20',
    };
    const gradientFallback = statusColors[status] ?? statusColors.closed;

    return (
        <Card
            className={cn(
                'group/card flex flex-col transition-all duration-200',
                'hover:shadow-lg hover:scale-[1.02]',
                isFeatured && 'ring-2 ring-primary/20 shadow-xl hover:shadow-xl'
            )}
        >
            {/* Thumbnail (default + featured only) */}
            {!isCompact && (
                <Link href={route('projects.show', slug)} className="block">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={title}
                                className="size-full object-cover transition-transform duration-200 group-hover/card:scale-105"
                            />
                        ) : (
                            <div className={cn('size-full bg-gradient-to-br', gradientFallback)} />
                        )}
                    </div>
                </Link>
            )}

            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">
                        <Link
                            href={route('projects.show', slug)}
                            className="hover:text-primary transition-colors"
                        >
                            {title}
                        </Link>
                    </CardTitle>

                    {isFeatured && (
                        <Star className="size-5 text-amber-500 shrink-0 mt-1 fill-amber-500" />
                    )}
                </div>

                {!isCompact && (
                    <CardDescription className="line-clamp-2">
                        {'description' in project ? project.description : title}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1">
                {/* Tech badges */}
                {displayTechs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {displayTechs.map((tech) => (
                            <Badge
                                key={tech.id}
                                variant="secondary"
                                className="text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                                {tech.name}
                            </Badge>
                        ))}
                        {overflowCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                                +{overflowCount}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Creator or Participants count */}
                {showCreator && (
                    <div className="flex items-center gap-2">
                        <Avatar size="sm">
                            <AvatarImage src={creator.avatar ?? undefined} />
                            <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                            Por: {creator.name}
                        </span>
                    </div>
                )}

                {showParticipants && participantsCount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{participantsCount} participante{participantsCount !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </CardContent>

            {/* Meta row footer (default + featured only) */}
            {!isCompact && (
                <CardFooter className="flex justify-between items-center gap-2">
                    <ProjectStatusBadge status={status} />

                    {participantsCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            <span>{participantsCount}</span>
                        </div>
                    )}

                    {createdAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>{relativeDate(createdAt)}</span>
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
