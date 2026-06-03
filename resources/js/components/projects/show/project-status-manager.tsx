import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { statusConfig, type ProjectStatus } from '@/components/projects/project-utils';

const transitions: Record<ProjectStatus, ProjectStatus[]> = {
    open: ['in_progress', 'closed'],
    in_progress: ['completed', 'closed'],
    completed: ['closed'],
    closed: [],
};

const transitionLabels: Record<string, string> = {
    in_progress: 'En Progreso',
    completed: 'Completado',
    closed: 'Cerrado',
};

interface ProjectStatusManagerProps {
    projectId: number;
    currentStatus: string;
}

export function ProjectStatusManager({ projectId, currentStatus }: ProjectStatusManagerProps) {
    const { data, setData, patch, processing, errors } = useForm({
        status: '',
    });

    const available = transitions[currentStatus as ProjectStatus] ?? [];

    if (available.length === 0) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.status) return;
        patch(route('projects.status.update', projectId), {
            preserveScroll: true,
        });
    }

    return (
        <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold text-sm text-card-foreground">
                Cambiar Estado
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                        {available.map((status) => (
                            <SelectItem key={status} value={status}>
                                {transitionLabels[status] ?? status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.status && (
                    <p className="text-destructive text-xs">{errors.status}</p>
                )}
                <Button type="submit" size="sm" disabled={processing || !data.status}>
                    Actualizar
                </Button>
            </form>
        </div>
    );
}
