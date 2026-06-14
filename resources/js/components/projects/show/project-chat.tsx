import { useEffect, useRef, useCallback, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-error';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    projectId: number;
    projectSlug: string;
    currentUserId?: number;
    messages?: Message[];
    className?: string;
    contentClassName?: string;
    messagesClassName?: string;
}

export function ProjectChat({
    projectId,
    projectSlug,
    currentUserId,
    messages,
    className,
    contentClassName,
    messagesClassName,
}: Props) {
    const [items, setItems] = useState(messages ?? []);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const forceScrollRef = useRef(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });
    const latestMessageId = items[items.length - 1]?.id;
    const hasChatAccess = messages !== undefined;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        bottomRef.current?.scrollIntoView?.({ behavior, block: 'end' });
        shouldAutoScrollRef.current = true;
        setHasNewMessages(false);
    }, []);

    const handleScroll = () => {
        const el = scrollContainerRef.current;

        if (!el) return;

        const threshold = 50;
        const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

        shouldAutoScrollRef.current = isAtBottom;

        if (isAtBottom) {
            setHasNewMessages(false);
        }
    };

    useEffect(() => {
        setItems(messages ?? []);
    }, [messages]);

    useEffect(() => {
        if (!hasChatAccess || typeof window === 'undefined' || !window.Echo) return;

        const channel = window.Echo.private(`project.${projectId}`);
        const handler = (message: Message) => {
            setItems((current) => {
                if (current.some((item) => item.id === message.id)) {
                    return current;
                }

                if (!shouldAutoScrollRef.current) {
                    setHasNewMessages(true);
                }

                return [...current, message];
            });
        };

        channel.listen('.message.created', handler);

        return () => {
            channel.stopListening('.message.created', handler);
            window.Echo?.leave?.(`project.${projectId}`);
        };
    }, [hasChatAccess, projectId]);

    useEffect(() => {
        if (!latestMessageId) return;

        if (forceScrollRef.current) {
            scrollToBottom('auto');
            forceScrollRef.current = false;
            return;
        }

        if (shouldAutoScrollRef.current) {
            scrollToBottom('smooth');
        }
    }, [latestMessageId, scrollToBottom]);

    if (!messages) return null;

    const submit = (event?: FormEvent) => {
        if (event) event.preventDefault();

        if (!data.body.trim()) return;

        forceScrollRef.current = true;

        post(route('projects.messages.store', projectSlug), {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                scrollToBottom('auto');
                toast.success('Mensaje enviado');
            },
            onError: () => toast.error('No se pudo enviar el mensaje'),
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            if (!processing) submit();
        }
    };

    return (
        <Card className={cn('border-primary/20 overflow-hidden', className)}>
            <CardHeader className="shrink-0">
                <CardTitle>Chat del proyecto</CardTitle>
                <CardDescription>Conversá con los miembros del equipo en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className={cn('min-h-0 flex flex-1 flex-col space-y-4', contentClassName)}>
                <div ref={scrollContainerRef} onScroll={handleScroll} className={cn('scrollbar-chat min-h-0 flex-1 space-y-3 overflow-y-auto pr-1', messagesClassName)}>
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
                    <div ref={bottomRef} aria-hidden="true" />
                </div>

                {hasNewMessages ? (
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => scrollToBottom('smooth')}>
                            Ver nuevos mensajes
                        </Button>
                    </div>
                ) : null}

                <form onSubmit={submit} className="shrink-0 space-y-2">
                    <Textarea
                        value={data.body}
                        onChange={(event) => setData('body', event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribí un mensaje..."
                        rows={3}
                        className="resize-y transition-all duration-200 min-h-16 max-h-48"
                    />
                    <div className="flex items-end justify-between gap-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                                Ctrl
                            </kbd>
                            <span>+</span>
                            <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                                Enter
                            </kbd>
                            <span className="ml-1">para enviar</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <FormError message={errors.body} />
                            <Button
                                type="submit"
                                variant="cta"
                                size="default"
                                disabled={processing}
                                className="transition-all duration-200 active:scale-95 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4" data-icon="inline-start" />
                                        <span>Enviar</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
