import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, PencilLine, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { Phase } from '@/types';

interface ProjectPhaseItemProps {
    phase: Phase;
    projectSlug: string;
    isCreator: boolean;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return 'Sin fecha';

    return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function ProjectPhaseItem({ phase, projectSlug, isCreator }: ProjectPhaseItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        title: phase.title,
        description: phase.description ?? '',
        completed_at: phase.completed_at ? phase.completed_at.slice(0, 10) : '',
    });

    function handleDelete() {
        router.delete(route('projects.phases.destroy', [projectSlug, phase.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            },
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(route('projects.phases.update', [projectSlug, phase.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    }

    if (isEditing) {
        return (
            <Card className="border-primary/20 bg-card/70 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Editar logro</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`phase-title-${phase.id}`}>Título</Label>
                            <Input
                                id={`phase-title-${phase.id}`}
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                            />
                            <FormError message={errors.title} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`phase-description-${phase.id}`}>Descripción</Label>
                            <Textarea
                                id={`phase-description-${phase.id}`}
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                rows={3}
                            />
                            <FormError message={errors.description} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`phase-completed-at-${phase.id}`}>Fecha de completado</Label>
                            <Input
                                id={`phase-completed-at-${phase.id}`}
                                type="date"
                                value={data.completed_at}
                                onChange={(event) => setData('completed_at', event.target.value)}
                            />
                            <FormError message={errors.completed_at} />
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/80 shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            {phase.title}
                        </CardTitle>
                        {phase.description ? (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {phase.description}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Sin descripción</p>
                        )}
                    </div>
                    <Badge variant="outline">
                        {phase.completed_at
                            ? `Completado el ${formatDate(phase.completed_at)}`
                            : `Registrado el ${formatDate(phase.created_at)}`}
                    </Badge>
                </div>
            </CardHeader>

            {isCreator && (
                <CardFooter className="justify-end gap-2 bg-muted/20">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <PencilLine className="size-4" data-icon="inline-start" />
                        Editar
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="size-4" data-icon="inline-start" />
                        Eliminar
                    </Button>
                </CardFooter>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar hito</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que querés eliminar &quot;{phase.title}&quot;? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
