import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageGalleryDialog } from '@/components/ui/image-gallery-dialog';
import { FormError } from '@/components/ui/form-error';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 5;

interface ImageUploaderProps {
    files: File[];
    existingImages?: ProjectImage[];
    onFilesChange: (files: File[]) => void;
    onRemoveExisting?: (imagePath: string) => void;
    error?: string;
}

export function ImageUploader({
    files,
    existingImages = [],
    onFilesChange,
    onRemoveExisting,
    error,
}: ImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndAddFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const fileArray = Array.from(newFiles);
            const remainingSlots = MAX_FILES - files.length;

            if (remainingSlots <= 0) {
                toast.error(`Máximo ${MAX_FILES} imágenes permitidas`);
                return;
            }

            const toAdd = fileArray.slice(0, remainingSlots);
            const validFiles: File[] = [];

            for (const file of toAdd) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} no es una imagen válida`);
                    continue;
                }
                if (file.size > MAX_FILE_SIZE) {
                    toast.error(
                        `${file.name} excede el tamaño máximo de 2MB`
                    );
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                onFilesChange([...files, ...validFiles]);
            }
        },
        [files, onFilesChange]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
                validateAndAddFiles(e.dataTransfer.files);
            }
        },
        [validateAndAddFiles]
    );

    const handleBrowse = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                validateAndAddFiles(e.target.files);
                e.target.value = '';
            }
        },
        [validateAndAddFiles]
    );

    const handleRemoveFile = useCallback(
        (index: number) => {
            onFilesChange(files.filter((_, i) => i !== index));
        },
        [files, onFilesChange]
    );

    const handleOpenExistingGallery = (index: number) => {
        setGalleryIndex(index);
        setGalleryOpen(true);
    };

    const totalImages = files.length + existingImages.length;

    const existingImageUrls = existingImages.map((img) => img.url);

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Drop zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                >
                    <Upload className="size-8 text-muted-foreground" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                            Arrastrá imágenes aquí
                        </p>
                        <p className="text-xs text-muted-foreground">
                            o hacé clic para seleccionar (máx. {MAX_FILES} imágenes, 2MB cada una)
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleBrowse}
                        className="hidden"
                    />
                </div>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium">Imágenes actuales</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {existingImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image.url}
                                        alt={`Imagen ${index + 1}`}
                                        className="size-full aspect-square object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => handleOpenExistingGallery(index)}
                                    />
                                    {onRemoveExisting && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveExisting(image.path);
                                            }}
                                        >
                                            <X className="size-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New file previews */}
                {files.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium">
                            Imágenes seleccionadas ({files.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="size-full object-cover"
                                            onLoad={(e) => {
                                                URL.revokeObjectURL(
                                                    (e.target as HTMLImageElement).src
                                                );
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <X className="size-3" />
                                    </Button>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                        {file.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {totalImages === 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="size-4" />
                        <p className="text-sm">Sin imágenes</p>
                    </div>
                )}

                <FormError message={error} />
            </div>

            <ImageGalleryDialog
                images={existingImageUrls}
                open={galleryOpen}
                initialIndex={galleryIndex}
                onOpenChange={setGalleryOpen}
            />
        </>
    );
}
