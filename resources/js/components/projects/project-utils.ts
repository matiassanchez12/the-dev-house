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
    return `/storage/${path}`;
}
