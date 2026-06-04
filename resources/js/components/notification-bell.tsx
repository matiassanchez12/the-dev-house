import { usePage, router, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';
import { NotificationList } from '@/components/notification-list';

interface User {
    id: number;
    name: string;
    slug: string;
    unread_notifications_count: number;
}

interface PageProps {
    auth: { user: User | null };
    notifications?: { data: NotificationItem[] };
}

export type { NotificationItem } from '@/components/notification-list';

export default function NotificationBell() {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;
    const unreadCount = user?.unread_notifications_count ?? 0;

    if (!user) return null;

    return (
        <Dropdown>
            <Dropdown.Trigger asChild>
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
                    <NotificationList limit={5} />
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
