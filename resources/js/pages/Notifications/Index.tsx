import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bell, Check } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    data: {
        type: 'join_request_received' | 'join_request_approved' | 'join_request_rejected';
        project_id: number;
        project_slug: string;
        project_title: string;
        applicant_id?: number;
        applicant_name?: string;
    };
    read_at: string | null;
    created_at: string;
}

const typeLabels: Record<Notification['data']['type'], string> = {
    join_request_received: 'Nueva solicitud de unirse a tu proyecto',
    join_request_approved: 'Tu solicitud fue aprobida',
    join_request_rejected: 'Tu solicitud fue rechazada',
};

export default function Index({ notifications }: { notifications: Notification[] }) {
    const handleMarkAsRead = (id: string) => {
        router.patch(route('notifications.read', id), {
            preserveScroll: true,
        });
    };

    const handleMarkAll = () => {
        router.post(route('notifications.read-all'), {}, { preserveScroll: true });
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <AppLayout>
            <Head title="Notificaciones" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <Bell className="h-6 w-6" />
                            Notificaciones
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {unreadCount === 0
                                ? 'No tenés notificaciones sin leer.'
                                : `${unreadCount} ${unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}.`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAll}>
                            <Check className="me-1 h-4 w-4" />
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-12 text-center">
                        <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h2 className="mt-4 text-lg font-semibold">Sin notificaciones</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Cuando alguien interactúe con tus proyectos, vas a ver las novedades acá.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={cn(
                                    'rounded-lg border p-4 transition',
                                    notification.read_at
                                        ? 'border-border bg-card'
                                        : 'border-primary/30 bg-primary/5'
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <Link
                                        href={route('projects.show', notification.data.project_slug)}
                                        onClick={() => {
                                            if (!notification.read_at) handleMarkAsRead(notification.id);
                                        }}
                                        className="flex-1"
                                    >
                                        <p className="font-medium">
                                            {typeLabels[notification.data.type] ?? 'Notificación'}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Proyecto: {notification.data.project_title}
                                        </p>
                                        {notification.data.applicant_name && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                De: {notification.data.applicant_name}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </Link>
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            Marcar leída
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
