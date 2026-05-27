import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { statusConfig, type StatusConfigEntry } from './project-utils';

interface ProjectStatusBadgeProps {
    status: string;
    className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
    const config: StatusConfigEntry = statusConfig[status] ?? statusConfig.closed;
    const StatusIcon = config.icon;

    return (
        <Badge
            variant="secondary"
            className={cn('gap-1.5', config.className, className)}
        >
            <StatusIcon className="size-3" />
            {config.label}
        </Badge>
    );
}
