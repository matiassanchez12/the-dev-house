import { Project, UserProject } from "@/types";

type ProjectCardVariant = 'default' | 'featured' | 'compact';

export interface ProjectCardViewModel {
    title: string;
    slug: string;
    description: string;
    status: Project['status'] | UserProject['status'];
    creator: Project['creator'] | UserProject['creator'] | null;
    techs: Project['techs'] | UserProject['techs'];
    displayTechs: NonNullable<Project['techs']> | NonNullable<UserProject['techs']>;
    overflowCount: number;
    participantsCount: number | undefined;
    createdAt: string | null;
    imageUrl: string | null;
    gradientFallback: string;
    isFeatured: boolean;
    isCompact: boolean;
    showCreator: boolean;
    showParticipants: boolean;
}

const STATUS_GRADIENTS = {
    open: 'from-green-400/20 to-green-600/20',
    in_progress: 'from-blue-400/20 to-blue-600/20',
    completed: 'from-purple-400/20 to-purple-600/20',
    closed: 'from-gray-400/20 to-gray-600/20',
} as const;

export function getProjectCardViewModel(
    project: Project | UserProject,
    variant: ProjectCardVariant,
    showParticipatingCount: boolean,
): ProjectCardViewModel {
    const isFeatured = variant === 'featured';
    const isCompact = variant === 'compact';

    const creator = 'creator' in project ? project.creator : null;
    const techs = project.techs ?? [];
    const images = 'images' in project ? project.images : null;
    const firstImage = images?.[0] ?? null;

    const participantsCount =
        'participants_count' in project ? project.participants_count : 0;

    const maxVisibleTechs = isCompact ? 4 : 4;
    const displayTechs = techs.slice(0, maxVisibleTechs);

    return {
        title: project.title,
        slug: project.slug,
        description: 'description' in project ? project.description : '',
        status: project.status,
        creator,
        techs,
        displayTechs,
        overflowCount: Math.max(techs.length - maxVisibleTechs, 0),
        participantsCount,
        createdAt: 'created_at' in project ? project.created_at : null,
        imageUrl: firstImage?.url ?? null,
        gradientFallback: STATUS_GRADIENTS[project.status] ?? STATUS_GRADIENTS.closed,
        isFeatured,
        isCompact,
        showCreator: !isCompact && Boolean(creator),
        showParticipants: isCompact || showParticipatingCount,
    };
}
