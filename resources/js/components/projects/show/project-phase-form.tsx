import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhaseDatePicker } from './phase-date-picker';
import { PhaseImageInput } from './phase-image-input';

interface ProjectPhaseFormProps {
    projectSlug: string;
    onSuccess?: () => void;
}

export function ProjectPhaseForm({ projectSlug, onSuccess }: ProjectPhaseFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        completed_at: '',
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('completed_at', data.completed_at);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        post(route('projects.phases.store', projectSlug), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setImageFile(null);
                onSuccess?.();
            },
        });
    }

    return (
        <Card className="border-primary/20 bg-card/70 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base">Registrar logro</CardTitle>
                <CardDescription>Sumá un avance ya cerrado al proyecto</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phase-title">Título</Label>
                        <Input
                            id="phase-title"
                            value={data.title}
                            onChange={(event) => setData('title', event.target.value)}
                            placeholder="Lanzamiento del MVP"
                            required
                        />
                        <FormError message={errors.title} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phase-description">Descripción</Label>
                        <Textarea
                            id="phase-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder="Contá qué se logró en este hito"
                            rows={3}
                        />
                        <FormError message={errors.description} />
                    </div>

                    <PhaseImageInput
                        file={imageFile}
                        onFileChange={setImageFile}
                        error={errors.image}
                    />

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phase-completed-at">Fecha de cierre</Label>
                        <PhaseDatePicker
                            id="phase-completed-at"
                            value={data.completed_at}
                            onChange={(value) => setData('completed_at', value)}
                        />
                        <FormError message={errors.completed_at} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        <Plus className="size-4" data-icon="inline-start" />
                        {processing ? 'Guardando...' : 'Registrar logro'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
