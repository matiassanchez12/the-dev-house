import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhaseDatePicker } from './phase-date-picker';
import { PhaseImageInput } from './phase-image-input';
import type { PhaseImage } from '@/types';

export interface ProjectPhaseValues {
    title: string;
    description: string;
    completed_at: string;
    image?: PhaseImage | null;
}

interface ProjectPhaseDrawerProps {
    projectSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phaseId?: number;
    initialValues?: ProjectPhaseValues;
}

const emptyValues: ProjectPhaseValues = { title: '', description: '', completed_at: '', image: null };

export function ProjectPhaseDrawer({ projectSlug, open, onOpenChange, phaseId, initialValues = emptyValues }: ProjectPhaseDrawerProps) {
    const isEditing = phaseId !== undefined;
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeExisting, setRemoveExisting] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: isEditing ? 'put' : 'post',
        ...initialValues,
    });

    useEffect(() => {
        if (open) {
            reset();
            setData('_method', isEditing ? 'put' : 'post');
            setData('title', initialValues.title);
            setData('description', initialValues.description);
            setData('completed_at', initialValues.completed_at);
            setData('image', initialValues.image ?? null);
            setImageFile(null);
            setRemoveExisting(false);
        }
    }, [open, initialValues, isEditing, reset, setData]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('_method', isEditing ? 'put' : 'post');
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('completed_at', data.completed_at);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const routeName = isEditing ? route('projects.phases.update', [projectSlug, phaseId]) : route('projects.phases.store', projectSlug);

        post(routeName, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="phase-title">Título</Label>
                <Input id="phase-title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Lanzamiento del MVP" required />
                <FormError message={errors.title} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="phase-description">Descripción</Label>
                <Textarea id="phase-description" value={data.description} onChange={(event) => setData('description', event.target.value)} placeholder="Contá qué se logró en este hito" rows={3} />
                <FormError message={errors.description} />
            </div>

            <PhaseImageInput
                file={imageFile}
                existingImage={removeExisting ? null : data.image}
                onFileChange={setImageFile}
                onRemoveExisting={() => setRemoveExisting(true)}
                error={errors.image}
            />

            <div className="flex flex-col gap-2">
                <Label htmlFor="phase-completed-at">Fecha de cierre</Label>
                <PhaseDatePicker id="phase-completed-at" value={data.completed_at} onChange={(value) => setData('completed_at', value)} />
                <FormError message={errors.completed_at} />
            </div>

            <Button type="submit" disabled={processing}>
                {processing ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar logro'}
            </Button>
        </form>
    );
}
