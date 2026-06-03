import type { Tech } from '@/types';

export interface LandingHeroProps {
    auth: { user: { id: number; name: string; email: string } | null };
    techs: Tech[];
    className?: string;
}

export interface HeroWordmarkProps {
    className?: string;
}

export interface HeroTechGridProps {
    techs: Tech[];
    className?: string;
}

export interface HeroCtaProps {
    auth: { user: { id: number } | null };
    className?: string;
}
