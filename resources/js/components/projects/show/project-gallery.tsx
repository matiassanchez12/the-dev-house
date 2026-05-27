import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageUrl } from '@/components/projects/project-utils';

interface ProjectGalleryProps {
    images: string[];
    title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
    const remainingImages = images.slice(1);

    if (remainingImages.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Galería</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {remainingImages.map((image, index) => (
                        <img
                            key={index}
                            src={storageUrl(image) ?? ''}
                            alt={`${title} - ${index + 2}`}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
