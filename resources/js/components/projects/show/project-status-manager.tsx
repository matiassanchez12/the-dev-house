import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { statusConfig, type ProjectStatus } from '@/components/projects/project-utils';

const transitions: Record<ProjectStatus, ProjectStatus[]> = {
    open: ['in_progress', 'closed', 'completed'],
    in_progress: ['completed', 'closed'],
    completed: ['closed'],
    closed: [],
    all: ['open', 'in_progress', 'closed', 'completed'],
};

interface ProjectStatusManagerProps {
    projectSlug: string;
    currentStatus: ProjectStatus;
}

export function ProjectStatusManager({ projectSlug, currentStatus }: ProjectStatusManagerProps) {
    const { data, setData, patch, processing, errors } = useForm({
        status: '',
    });

    const available = transitions['all'];

    if (available.length === 0) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.status) return;
        patch(route('projects.status.update', projectSlug), {
            preserveScroll: true,
        });
    }

    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle>Cambiar Estado</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
                    <Select
                        key={currentStatus}
                        value={data.status} onValueChange={(v) => setData('status', v || '')}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione estado">
                                {(value: string | null) =>
                                    value ? statusConfig[value as ProjectStatus]?.label : 'Seleccione estado'
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {available.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {statusConfig[status]?.label ?? status}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-destructive text-xs">{errors.status}</p>
                    )}
                    <Button type="submit" size="sm" disabled={processing || !data.status}>
                        Actualizar
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
