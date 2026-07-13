import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import type { PhaseImage } from '@/types';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

interface PhaseImageInputProps {
    file: File | null;
    existingImage?: PhaseImage | null;
    onFileChange: (file: File | null) => void;
    error?: string;
}

export function PhaseImageInput({ file, existingImage, onFileChange, error }: PhaseImageInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.size > MAX_FILE_SIZE) {
            return;
        }

        onFileChange(selected);
        e.target.value = '';
    }

    function handleRemove() {
        onFileChange(null);
    }

    const previewUrl = file ? URL.createObjectURL(file) : null;
    const hasImage = file || existingImage;

    return (
        <div className="flex flex-col gap-2">
            <Label>Imagen (opcional)</Label>

            {hasImage ? (
                <div className="flex items-start gap-3">
                    <img
                        src={previewUrl || existingImage?.url}
                        alt="Vista previa"
                        className="size-24 rounded-lg border object-cover"
                        onLoad={(e) => {
                            if (previewUrl) URL.revokeObjectURL((e.target as HTMLImageElement).src);
                        }}
                    />

                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="size-4" data-icon="inline-start" />
                            {file ? 'Cambiar imagen' : 'Reemplazar imagen'}
                        </Button>

                        {file && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                            >
                                <X className="size-4" data-icon="inline-start" />
                                Quitar selección
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-3 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                    <Upload className="size-4" />
                    Seleccionar imagen
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBrowse}
                className="hidden"
            />

            <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 2MB.</p>
            <FormError message={error} />
        </div>
    );
}
