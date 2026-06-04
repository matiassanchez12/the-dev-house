import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    slug: string;
    unread_notifications_count: number;
}

interface PageProps {
    auth: { user: User | null };
}

interface NotificationBellLinkProps {
    className?: string;
}

export default function NotificationBellLink({ className }: NotificationBellLinkProps) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;
    const unreadCount = user?.unread_notifications_count ?? 0;

    if (!user) return null;

    return (
        <Link
            href={route('notifications.index')}
            aria-label="Notificaciones"
            className={cn(
                'relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none',
                className,
            )}
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
        </Link>
    );
}
