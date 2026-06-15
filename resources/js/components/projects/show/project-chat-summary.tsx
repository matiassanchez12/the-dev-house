import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types';

interface Props {
    projectSlug: string;
    messagesCount?: number;
    messages?: Message[];
}

export function ProjectChatSummary({ projectSlug, messagesCount, messages }: Props) {
    const count = messagesCount ?? messages?.length ?? 0;
    const latestMessage = messages?.at(-1);

    return (
        <Card className="border-primary/20">
            <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">Chat del proyecto</CardTitle>
                </div>
                <CardDescription>
                    {count} mensajes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {count === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay mensajes.</p> : null}

                {latestMessage ? (
                    <p className="text-sm text-muted-foreground">
                        Último: <span className="font-medium text-foreground">{latestMessage.body}</span>
                    </p>
                ) : null}

                <Link href={route('projects.chat', projectSlug)}>
                    <Button variant="outline" className="w-full">
                        Abrir chat
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
