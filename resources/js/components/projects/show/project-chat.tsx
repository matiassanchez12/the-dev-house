import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-error';
import type { Message } from '@/types';

interface Props {
    projectId: number;
    projectSlug: string;
    currentUserId?: number;
    messages?: Message[];
}

export function ProjectChat({ projectId, projectSlug, currentUserId, messages }: Props) {
    const [items, setItems] = useState(messages ?? []);
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

    useEffect(() => {
        setItems(messages ?? []);
    }, [messages]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) return;

        const channel = window.Echo.private(`project.${projectId}`);
        const handler = (message: Message) => {
            setItems((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
        };

        channel.listen('.message.created', handler);

        return () => {
            channel.stopListening('.message.created', handler);
            window.Echo.leave(`project.${projectId}`);
        };
    }, [projectId]);

    if (!messages) return null;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(route('projects.messages.store', projectSlug), {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                toast.success('Mensaje enviado');
            },
            onError: () => toast.error('No se pudo enviar el mensaje'),
        });
    };

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle>Chat del proyecto</CardTitle>
                <CardDescription>Conversá con los miembros del equipo en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Todavía no hay mensajes.</p>
                    ) : items.map((message) => {
                        const isOwn = message.user_id === currentUserId;

                        return (
                            <div key={message.id} className={`flex gap-3 ${isOwn ? 'ml-auto max-w-[90%] flex-row-reverse' : ''}`}>
                                <Avatar className="size-8 shrink-0">
                                    <AvatarImage src={message.sender?.avatar ?? undefined} alt={message.sender?.name ?? 'Usuario'} />
                                    <AvatarFallback>{message.sender?.name?.slice(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div className={`flex-1 rounded-none border p-3 ${isOwn ? 'bg-muted/60' : 'bg-background'}`}>
                                    <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{message.sender?.name ?? 'Usuario'}</span>
                                        <span>{new Date(message.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <Textarea
                        value={data.body}
                        onChange={(event) => setData('body', event.target.value)}
                        placeholder="Escribí un mensaje..."
                        rows={3}
                    />
                    <FormError message={errors.body} />
                    <Button type="submit" disabled={processing}>
                        <Send className="size-4" data-icon="inline-start" />
                        {processing ? 'Enviando...' : 'Enviar'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
