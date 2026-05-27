import { useState } from 'react';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { ImageGalleryDialog } from '@/components/ui/image-gallery-dialog';
import { storageUrl } from '@/components/projects/project-utils';
import type { User } from '@/types';

interface ProjectHeroProps {
    title: string;
    status: string;
    images: string[] | null | undefined;
    creatorName: string;
}

export function ProjectHero({ title, status, images, creatorName }: ProjectHeroProps) {
    const [galleryOpen, setGalleryOpen] = useState(false);

    if (images && images.length > 0) {
        return (
            <>
                <div
                    className="relative mb-8 overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setGalleryOpen(true)}
                >
                    <img
                        src={storageUrl(images[0]) ?? ''}
                        alt={title}
                        className="w-full h-96 sm:h-[450px] object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3">
                            <ProjectStatusBadge status={status} />
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                        </div>
                    </div>
                </div>
                <ImageGalleryDialog
                    images={images.map((img) => storageUrl(img) ?? '')}
                    open={galleryOpen}
                    initialIndex={0}
                    onOpenChange={setGalleryOpen}
                />
            </>
        );
    }

    return (
        <div className="relative mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-8">
            <div className="flex items-center gap-4">
                <ProjectStatusBadge status={status} />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            </div>
        </div>
    );
}
