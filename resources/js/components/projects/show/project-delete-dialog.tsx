import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ProjectDeleteDialogProps {
    projectSlug: string;
    projectTitle: string;
    onDeleted: () => void;
}

export function ProjectDeleteDialog({ projectSlug, projectTitle, onDeleted }: ProjectDeleteDialogProps) {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        router.delete(route('projects.destroy', projectSlug), {
            onSuccess: () => {
                setOpen(false);
                toast.success('Proyecto eliminado exitosamente');
                onDeleted();
            },
            onError: () => toast.error('Error al eliminar el proyecto'),
        });
    };

    return (
        <>
            <Button variant="destructive" onClick={() => setOpen(true)}>
                <Trash2 className="size-4" data-icon="inline-start" />
                Eliminar
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Proyecto</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que querés eliminar &quot;{projectTitle}&quot;? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
