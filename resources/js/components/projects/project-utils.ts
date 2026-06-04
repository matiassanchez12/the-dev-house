import { Zap, GitBranch, CheckCircle, XCircle } from 'lucide-react';

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'closed';

export interface StatusConfigEntry {
    label: string;
    icon: typeof Zap;
    className: string;
}

export const statusConfig: Record<string, StatusConfigEntry> = {
    open: {
        label: 'Open',
        icon: Zap,
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    in_progress: {
        label: 'En Progreso',
        icon: GitBranch,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    completed: {
        label: 'Completado',
        icon: CheckCircle,
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    },
    closed: {
        label: 'Cerrado',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    },
};

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function storageUrl(path: string | null | undefined): string | null {
    if (!path) return null;

    // Already a full URL (S3, external, etc.)
    if (path.includes('://')) {
        return path;
    }

    // Already has /storage/ prefix from backend
    if (path.startsWith('/storage/')) {
        return path;
    }

    // Local storage path
    return `/storage/${path}`;
}

export function avatarUrl(path: string | null | undefined): string | null {
    return storageUrl(path);
}

export function relativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr} ${diffHr === 1 ? 'hora' : 'horas'}`;
    if (diffDay < 30) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    if (diffMonth < 12) return `hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`;
    return `hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`;
}
