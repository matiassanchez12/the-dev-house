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
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        completed_at: '',
        image: null as File | null,
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(route('projects.phases.store', projectSlug), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
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
                        file={data.image}
                        onFileChange={(file) => setData('image', file)}
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
