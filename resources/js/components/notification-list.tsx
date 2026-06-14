import { router, usePage, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationItem {
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

const typeLabels: Record<NotificationItem['data']['type'], string> = {
    join_request_received: 'quiere unirse a tu proyecto',
    join_request_approved: 'aprobó tu solicitud',
    join_request_rejected: 'rechazó tu solicitud',
};

interface NotificationListProps {
    limit?: number;
    emptyText?: string;
}

export function NotificationList({ limit, emptyText = 'Sin notificaciones' }: NotificationListProps) {
    const page = usePage<{ notifications?: NotificationItem[] | { data: NotificationItem[] } }>();
    const notificationsProp = page.props.notifications;
    const notifications = Array.isArray(notificationsProp)
        ? notificationsProp
        : notificationsProp?.data ?? [];
    const items = limit ? notifications.slice(0, limit) : notifications;

    if (items.length === 0) {
        return (
            <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-border">
            {items.map((n) => {
                const label = typeLabels[n.data.type] ?? 'actualizó un proyecto';
                const project = n.data.project_title;
                const from = n.data.applicant_name;

                return (
                    <li key={n.id}>
                        <Link
                            href={route('join-requests.index')}
                            onClick={() => {
                                if (!n.read_at) {
                                    router.patch(route('notifications.read', n.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className={cn(
                                'block px-4 py-3 transition hover:bg-muted',
                                !n.read_at && 'bg-primary/5',
                            )}
                        >
                            <p className="text-sm text-foreground">
                                {from && <span className="font-semibold">{from}</span>}{' '}
                                <span className="text-muted-foreground">{label}</span>{' '}
                                <span className="font-medium">{project}</span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(n.created_at).toLocaleDateString()}
                            </p>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
