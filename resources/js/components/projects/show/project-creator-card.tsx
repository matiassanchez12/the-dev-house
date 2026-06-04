import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, avatarUrl } from '@/components/projects/project-utils';
import type { User } from '@/types';

interface ProjectCreatorCardProps {
    creator: User;
}

export function ProjectCreatorCard({ creator }: ProjectCreatorCardProps) {
    const initials = getInitials(creator.name);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Creador</CardTitle>
            </CardHeader>
            <CardContent>
                <Link
                    href={route('users.show', creator.slug)}
                    className="flex items-center gap-3 group"
                >
                    <Avatar className="size-10">
                        <AvatarImage src={avatarUrl(creator.avatar) ?? undefined} alt={creator.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground group-hover:underline">
                            {creator.name}
                        </span>
                        <span className="text-xs text-muted-foreground">Ver perfil</span>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}
