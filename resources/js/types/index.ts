export interface User {
    id: number;
    name: string;
    email: string;
    bio?: string | null;
    avatar?: string | null;
    slug?: string;
    email_verified_at?: string | null;
    unread_notifications_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Tech {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    created_at: string;
    updated_at: string;
    pivot?: {
        level?: string | null;
        years_experience?: number | null;
        proficiency?: string | null;
    };
}

export interface ProjectImage {
    path: string;
    url: string;
}

export interface Phase {
    id: number;
    project_id: number;
    title: string;
    description?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    project?: Project;
}

export type ProjectViewerRole = 'guest' | 'creator' | 'member';

export interface Project {
    id: number;
    user_id: number;
    title: string;
    slug: string;
    description: string;
    vision?: string | null;
    images?: ProjectImage[] | null;
    status: 'open' | 'in_progress' | 'closed' | 'completed';
    repository_url?: string | null;
    demo_url?: string | null;
    created_at: string;
    updated_at: string;
    creator?: User;
    techs?: Tech[];
    phases?: Phase[];
    participants_count?: number;
    messages_count?: number;
    messages?: Message[];
    viewer_role?: ProjectViewerRole;
    viewerJoinRequest?: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
        message?: string;
    } | null;
    viewerPendingInvitation?: ProjectInvitation | null;
}

export interface ProjectInvitation {
    id: number;
    project_id: number;
    invited_user_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    message?: string | null;
    cancelled_at?: string | null;
    responded_at?: string | null;
    created_at: string;
    updated_at: string;
    project?: Project;
    invitedUser?: User & { techs?: Tech[] };
    invited_user?: User & { techs?: Tech[] };
}

export interface CollaboratorSuggestion {
    user: User & { techs?: Tech[] };
    matching_techs: Tech[];
    pending_invitation?: ProjectInvitation | null;
}

export interface JoinRequest {
    id: number;
    project_id: number;
    user_id: number;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_at?: string | null;
    created_at: string;
    updated_at: string;
    applicant?: User;
    project?: Project;
}

export interface Message {
    id: number;
    project_id: number;
    user_id: number;
    body: string;
    type: 'text' | 'image' | 'file';
    file_url?: string | null;
    read_at?: string | null;
    created_at: string;
    updated_at: string;
    sender?: User;
}

export type Platform = 'github' | 'linkedin' | 'twitter' | 'website' | 'youtube' | 'discord' | 'stackoverflow';

export interface SocialLink {
    id?: number;
    platform: Platform;
    url: string;
    _destroy?: boolean;
}

export interface ProjectParticipant {
    id: number;
    project_id: number;
    user_id: number;
    role?: string | null;
    joined_at: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

// Public user profile types
export interface UserProfile {
    id: number;
    name: string;
    bio: string | null;
    avatar: string | null;
    created_at?: string;
    socialLinks?: SocialLink[];
    createdProjects: UserProject[];
    participatingProjects: UserProject[];
    techs: UserTech[];
}

export interface UserProject {
    id: number;
    title: string;
    slug: string;
    status: 'open' | 'in_progress' | 'closed' | 'completed';
    images: ProjectImage[] | null;
    description: string;
    creator: {
        id: number;
        name: string;
        avatar?: string | null;
    };
    techs: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
    participants_count: number;
    created_at: string;
}

export interface UserTech {
    id: number;
    name: string;
    slug: string;
    years: number | null;
    proficiency?: string | null;
}

export interface DiscoverableUser {
    id: number;
    name: string;
    avatar: string | null;
    bio: string | null;
    techs: Array<{ id: number; name: string; slug: string }>;
    created_projects_count: number;
    joined_projects_count: number;
}

export interface ImageGalleryDialogProps {
    /** Array of image URLs to display */
    images: string[];
    /** Whether the dialog is open */
    open: boolean;
    /** Index of the image to show initially (resets on each open) */
    initialIndex: number;
    /** Called when open state changes (close) */
    onOpenChange: (open: boolean) => void;
}

// Landing page props
export interface LandingPageProps {
    user_count: number;
    project_count: number;
    collaboration_count: number;
    techs: Tech[];
}
