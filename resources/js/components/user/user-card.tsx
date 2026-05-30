import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscoverableUser } from '@/types';

interface UserCardProps {
    user: DiscoverableUser;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function truncateBio(bio: string | null, maxLength: number = 100): string {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength).trimEnd() + '…';
}

export function UserCard({ user }: UserCardProps) {
    const displayedTechs = user.techs.slice(0, 3);
    const remainingTechs = user.techs.length - 3;

    return (
        <Card className="h-full transition-colors hover:bg-muted/30">
            <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                    <Link href={route('users.show', user.slug)} className="shrink-0">
                        <Avatar size="lg">
                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <Link href={route('users.show', user.slug)} className="hover:underline">
                            <CardTitle className="truncate">{user.name}</CardTitle>
                        </Link>
                        {user.bio && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {truncateBio(user.bio)}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex flex-1 flex-col justify-end">
                {displayedTechs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {displayedTechs.map((tech) => (
                            <Badge key={tech.id} variant="secondary" className="text-xs">
                                {tech.name}
                            </Badge>
                        ))}
                        {remainingTechs > 0 && (
                            <Badge variant="outline" className="text-xs">
                                +{remainingTechs}
                            </Badge>
                        )}
                    </div>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{user.created_projects_count} proyecto{user.created_projects_count !== 1 ? 's' : ''} creado{user.created_projects_count !== 1 ? 's' : ''}</span>
                </div>
            </CardContent>
        </Card>
    );
}