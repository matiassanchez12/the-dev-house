import { usePage, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

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

interface User {
    id: number;
    name: string;
    slug: string;
    unread_notifications_count: number;
}

interface PageProps {
    auth: { user: User | null };
    notifications?: { data: Notification[] };
}

const typeLabels: Record<Notification['data']['type'], string> = {
    join_request_received: 'quiere unirse a tu proyecto',
    join_request_approved: 'aprobó tu solicitud',
    join_request_rejected: 'rechazó tu solicitud',
};

export default function NotificationBell() {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;
    const unreadCount = user?.unread_notifications_count ?? 0;

    if (!user) return null;

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    aria-label="Notificaciones"
                    className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -end-1 -top-1 h-5 min-w-5 justify-center px-1 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                router.post(route('notifications.read-all'), {}, { preserveScroll: true })
                            }
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Marcar todas
                        </button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    <NotificationList />
                </div>

                <div className="border-t border-border p-2">
                    <Link
                        href={route('notifications.index')}
                        className="block rounded-md px-3 py-2 text-center text-sm font-medium text-primary transition hover:bg-muted"
                    >
                        Ver todas
                    </Link>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}

function NotificationList() {
    const page = usePage<{ notifications?: { data: Notification[] } }>();
    const notifications = page.props.notifications?.data ?? [];

    if (notifications.length === 0) {
        return (
            <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Sin notificaciones</p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-border">
            {notifications.slice(0, 5).map((n) => {
                const label = typeLabels[n.data.type] ?? 'actualizó un proyecto';
                const project = n.data.project_title;
                const from = n.data.applicant_name;

                return (
                    <li key={n.id}>
                        <Link
                            href={route('projects.show', n.data.project_slug)}
                            onClick={() => {
                                if (!n.read_at) {
                                    router.patch(route('notifications.read', n.id), {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className={cn(
                                'block px-4 py-3 transition hover:bg-muted',
                                !n.read_at && 'bg-primary/5'
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
