import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/components/projects/project-utils';
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
                        return (
                            <Avatar key={participant.id} className="size-8">
                                <AvatarImage
                                    src={participant.avatar ?? undefined}
                                    alt={participant.name}
                                />
                                <AvatarFallback className="text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
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
