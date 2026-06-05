import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { FormError } from '@/components/ui/form-error';
import { ImageUploader } from '@/components/projects/image-uploader';
import { Tech, Project as ProjectType } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
    mode: 'create' | 'edit';
    project?: ProjectType & { techs?: Tech[] };
    techs: Tech[];
    form: ReturnType<typeof import('@inertiajs/react').useForm<{
        title: string;
        description: string;
        vision: string;
        techs: number[];
        repository_url: string;
        demo_url: string;
        images: File[];
        remove_images?: string[];
    }>>;
    onSubmit: (e: React.FormEvent) => void;
    cancelUrl: string;
    submitLabel: string;
}

const TITLE_MAX = 255;
const DESCRIPTION_MAX = 1000;

function Counter({ current, max }: { current: number; max: number }) {
    const ratio = current / max;
    const isNearLimit = ratio >= 0.9;

    return (
        <p
            className={cn(
                'mt-1 text-xs text-muted-foreground transition-colors',
                isNearLimit && 'text-destructive'
            )}
        >
            {current} / {max}
        </p>
    );
}

export function ProjectForm({
    mode,
    project,
    techs,
    form,
    onSubmit,
    cancelUrl,
    submitLabel,
}: ProjectFormProps) {
    const { data, setData, processing, errors } = form;

    const handleTechChange = (techId: number, checked: boolean) => {
        if (checked) {
            setData('techs', [...data.techs, techId]);
        } else {
            setData('techs', data.techs.filter((id) => id !== techId));
        }
    };

    const handleImagesChange = (files: File[]) => {
        setData('images', files);
    };

    const handleRemoveExistingImage = (imagePath: string) => {
        setData('remove_images', [...(data.remove_images ?? []), imagePath]);
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {/* Basic Info */}
            <div className="flex flex-col gap-4">
                <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Ej: Plataforma de E-commerce"
                        maxLength={TITLE_MAX}
                        required
                    />
                    <Counter current={data.title.length} max={TITLE_MAX} />
                    <FormError message={errors.title} />
                </div>

                <div>
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Describí de qué trata tu proyecto..."
                        rows={4}
                        maxLength={DESCRIPTION_MAX}
                        required
                    />
                    <Counter current={data.description.length} max={DESCRIPTION_MAX} />
                    <FormError message={errors.description} />
                </div>

                <div>
                    <Label htmlFor="vision">Visión del Proyecto (opcional)</Label>
                    <Textarea
                        id="vision"
                        value={data.vision}
                        onChange={(e) => setData('vision', e.target.value)}
                        placeholder="¿Qué querés lograr con este proyecto a largo plazo?"
                        rows={3}
                    />
                </div>
            </div>

            <Separator />

            {/* Tech Stack */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label>Tecnologías Requeridas *</Label>
                    {data.techs.length > 0 && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {data.techs.length} seleccionada{data.techs.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div className="max-h-48 overflow-y-auto rounded-md border p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {techs.map((tech) => {
                            const isChecked = data.techs.includes(tech.id);
                            return (
                                <label
                                    key={tech.id}
                                    htmlFor={`tech-${tech.id}`}
                                    className="flex items-center gap-2 rounded-md p-2 cursor-pointer hover:bg-muted transition-colors"
                                >
                                    <Checkbox
                                        id={`tech-${tech.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            handleTechChange(tech.id, checked === true)
                                        }
                                    />
                                    <span className="text-sm select-none">{tech.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
                <FormError message={errors.techs} />
            </div>

            <Separator />

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="repository_url">Repositorio (opcional)</Label>
                    <Input
                        id="repository_url"
                        type="url"
                        value={data.repository_url}
                        onChange={(e) => setData('repository_url', e.target.value)}
                        placeholder="https://github.com/..."
                    />
                    <FormError message={errors.repository_url} />
                </div>
                <div>
                    <Label htmlFor="demo_url">Demo (opcional)</Label>
                    <Input
                        id="demo_url"
                        type="url"
                        value={data.demo_url}
                        onChange={(e) => setData('demo_url', e.target.value)}
                        placeholder="https://mi-proyecto.com"
                    />
                    <FormError message={errors.demo_url} />
                </div>
            </div>

            <Separator />

            {/* Media */}
            <div className="flex flex-col gap-3">
                <Label>
                    {mode === 'edit' ? 'Imágenes del Proyecto' : 'Imágenes del Proyecto (opcional)'}
                </Label>
                <ImageUploader
                    files={data.images}
                    existingImages={
                        mode === 'edit'
                            ? (project?.images ?? []).filter(
                                  (img) => !(data.remove_images ?? []).includes(img.path)
                              )
                            : []
                    }
                    onFilesChange={handleImagesChange}
                    onRemoveExisting={
                        mode === 'edit' ? handleRemoveExistingImage : undefined
                    }
                    error={errors.images}
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : submitLabel}
                </Button>
                <Link href={cancelUrl}>
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                </Link>
            </div>
        </form>
    );
}
