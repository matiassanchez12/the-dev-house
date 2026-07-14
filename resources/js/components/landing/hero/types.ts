import type { Tech } from '@/types'

export interface LandingHeroProps {
    auth: { user: { id: number; name: string } | null }
    techs: Tech[]
    user_count: number
    className?: string
}

export interface HeroWordmarkProps {
    className?: string
}

export interface HeroHeadlineProps {
    userCount: number
}

export interface HeroTechGridProps {
    techs: Tech[]
    className?: string
}

export interface HeroCtaProps {
    auth: { user: { id: number } | null }
    className?: string
}
