import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CollaboratorSuggestion } from '@/types';

interface CollaboratorSuggestionCardProps {
    projectSlug: string;
    suggestion: CollaboratorSuggestion;
}

export default function CollaboratorSuggestionCard({ projectSlug, suggestion }: CollaboratorSuggestionCardProps) {
    const isPending = suggestion.pending_invitation !== null && suggestion.pending_invitation !== undefined;

    const invite = () => {
        router.post(route('project-invitations.store', projectSlug), {
            invited_user_id: suggestion.user.id,
        }, {
            preserveScroll: true,
        });
    };

    const cancel = () => {
        if (!suggestion.pending_invitation) {
            return;
        }

        router.delete(route('project-invitations.destroy', suggestion.pending_invitation.id), {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{suggestion.user.name}</CardTitle>
                <CardDescription>
                    {isPending ? 'Invitation pending' : 'Matches your project tech stack'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {suggestion.matching_techs.map((tech) => (
                        <Badge key={tech.id} variant="secondary">
                            {tech.name}
                        </Badge>
                    ))}
                </div>

                {isPending ? (
                    <Button variant="outline" onClick={cancel}>
                        Cancel invitation
                    </Button>
                ) : (
                    <Button onClick={invite}>Send invitation</Button>
                )}
            </CardContent>
        </Card>
    );
}
