export interface User {
    id: number;
    name: string;
    email: string;
    bio?: string | null;
    avatar?: string | null;
    email_verified_at?: string | null;
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

export interface Project {
    id: number;
    user_id: number;
    title: string;
    slug: string;
    description: string;
    vision?: string | null;
    images?: string[] | null;
    status: 'open' | 'closed' | 'completed';
    repository_url?: string | null;
    demo_url?: string | null;
    created_at: string;
    updated_at: string;
    creator?: User;
    techs?: Tech[];
    participants_count?: number;
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
