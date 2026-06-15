import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, PencilLine, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Phase } from '@/types';

interface ProjectPhaseItemProps {
    phase: Phase;
    projectSlug: string;
    canManage?: boolean;
    onEdit?: () => void;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ProjectPhaseItem({ phase, projectSlug, canManage = false, onEdit }: ProjectPhaseItemProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    function handleDelete() {
        router.delete(route('projects.phases.destroy', [projectSlug, phase.id]), { preserveScroll: true, onSuccess: () => setIsDeleteDialogOpen(false) });
    }

    return (
        <Card className="bg-card/80 shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="size-4 text-emerald-600" />{phase.title}</CardTitle>
                        {phase.description ? <p className="text-sm text-muted-foreground whitespace-pre-wrap">{phase.description}</p> : <p className="text-sm text-muted-foreground">Sin descripción</p>}
                    </div>
                    <Badge variant="outline">{phase.completed_at ? `Completado el ${formatDate(phase.completed_at)}` : `Registrado el ${formatDate(phase.created_at)}`}</Badge>
                </div>
            </CardHeader>
            {canManage && (
                <CardFooter className="justify-end gap-2 bg-muted/20">
                    <Button type="button" variant="outline" size="sm" onClick={onEdit}><PencilLine className="size-4" data-icon="inline-start" />Editar</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}><Trash2 className="size-4" data-icon="inline-start" />Eliminar</Button>
                </CardFooter>
            )}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Eliminar hito</DialogTitle><DialogDescription>¿Estás seguro de que querés eliminar &quot;{phase.title}&quot;? Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
