import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { avatarUrl, getInitials } from '@/components/projects/project-utils';
import { User } from '@/types';

interface ProjectParticipantsProps {
    participants: User[];
}

const MAX_VISIBLE = 5;

export function ProjectParticipants({ participants }: ProjectParticipantsProps) {
    if (participants.length === 0) {
        return null;
    }

    const visible = participants.slice(0, MAX_VISIBLE);
    const remaining = participants.length - MAX_VISIBLE;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Participantes ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {visible.map((participant) => {
                        const initials = getInitials(participant.name);

                        const avatar = (
                            <Avatar className="size-8 transition-opacity hover:opacity-90">
                                <AvatarImage
                                    src={avatarUrl(participant.avatar) ?? undefined}
                                    alt={participant.name}
                                />
                                <AvatarFallback className="text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        );

                        return (
                            participant.slug ? (
                                <Link
                                    key={participant.id}
                                    href={route('users.show', participant.slug)}
                                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={`Ver perfil de ${participant.name}`}
                                >
                                    {avatar}
                                </Link>
                            ) : (
                                <div key={participant.id}>{avatar}</div>
                            )
                        );
                    })}
                    {remaining > 0 && (
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ring-2 ring-background">
                            +{remaining}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
