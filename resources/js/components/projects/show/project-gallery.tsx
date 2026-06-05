import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageGalleryDialog } from '@/components/ui/image-gallery-dialog';
import type { ProjectImage } from '@/types';

interface ProjectGalleryProps {
    images: ProjectImage[];
    title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const remainingImages = images.slice(1);

    const handleOpenGallery = (index: number) => {
        setGalleryIndex(index + 1); // +1 because remainingImages starts at index 1
        setGalleryOpen(true);
    };

    if (remainingImages.length === 0) {
        return null;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Galería</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {remainingImages.map((image, index) => (
                            <img
                                key={index}
                                src={image.url}
                                alt={`${title} - ${index + 2}`}
                                className="w-full h-48 sm:h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleOpenGallery(index)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
            <ImageGalleryDialog
                images={images.map((img) => img.url)}
                open={galleryOpen}
                initialIndex={galleryIndex}
                onOpenChange={setGalleryOpen}
            />
        </>
    );
}
