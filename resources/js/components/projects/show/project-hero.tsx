import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { storageUrl } from '@/components/projects/project-utils';
import type { User } from '@/types';

interface ProjectHeroProps {
    title: string;
    status: string;
    images: string[] | null | undefined;
    creatorName: string;
}

export function ProjectHero({ title, status, images, creatorName }: ProjectHeroProps) {
    if (images && images.length > 0) {
        return (
            <div className="relative mb-8 overflow-hidden rounded-xl">
                <img
                    src={storageUrl(images[0]) ?? ''}
                    alt={title}
                    className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3">
                        <ProjectStatusBadge status={status} />
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                    </div>
                </div>
            </div>
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
