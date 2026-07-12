import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectInvitationResponseCardProps {
    invitationId: number;
    message?: string | null;
}

export function ProjectInvitationResponseCard({ invitationId, message }: ProjectInvitationResponseCardProps) {
    const handleResponse = (action: 'accept' | 'reject') => {
        router.post(route(`project-invitations.${action}`, invitationId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle>Te invitaron a colaborar</CardTitle>
                <CardDescription>
                    {message ?? 'Respondé a esta invitación.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button
                    type="button"
                    className="w-full"
                    onClick={() => handleResponse('accept')}
                >
                    Aceptar invitación
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleResponse('reject')}
                >
                    Rechazar invitación
                </Button>
            </CardContent>
        </Card>
    );
}
