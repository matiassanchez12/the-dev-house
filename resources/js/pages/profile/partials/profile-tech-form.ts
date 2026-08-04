import type { TechProficiency } from '@/lib/tech-proficiency'

export interface ProfileTechFormEntry {
    id: number
    years_experience: number
    proficiency: TechProficiency
}

export const TECH_YEARS_MIN = 0
export const TECH_YEARS_MAX = 50
export const TECH_YEARS_STEP = 1
export const TECH_PROFICIENCY_SLIDER_MIN = 1
export const TECH_PROFICIENCY_SLIDER_MAX = 5
