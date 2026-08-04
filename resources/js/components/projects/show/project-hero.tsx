import { type ReactNode, useState } from 'react';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { ImageGalleryDialog } from '@/components/ui/image-gallery-dialog';
import type { ProjectImage } from '@/types';

interface ProjectHeroProps {
    title: string;
    status: string;
    images: ProjectImage[] | null | undefined;
    followSection?: ReactNode;
}

export function ProjectHero({ title, status, images, followSection }: ProjectHeroProps) {
    const [galleryOpen, setGalleryOpen] = useState(false);

    if (images && images.length > 0) {
        return (
            <>
                <div
                    role="region"
                    aria-label="Project hero"
                    className="relative mb-8 overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setGalleryOpen(true)}
                >
                    <img
                        src={images[0].url}
                        alt={title}
                        className="w-full h-96 sm:h-[450px] object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <ProjectStatusBadge status={status} />
                                    <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                                </div>
                            </div>
                            {followSection ? (
                                <div className="w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
                                    {followSection}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <ImageGalleryDialog
                    images={images.map((img) => img.url)}
                    open={galleryOpen}
                    initialIndex={0}
                    onOpenChange={setGalleryOpen}
                />
            </>
        );
    }

    return (
        <div role="region" aria-label="Project hero" className="relative mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <ProjectStatusBadge status={status} />
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
                    </div>
                </div>
                {followSection ? <div className="w-full max-w-sm">{followSection}</div> : null}
            </div>
        </div>
    );
}
