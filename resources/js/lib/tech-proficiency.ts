import type { UserTech } from '@/types';

export const TECH_PROFICIENCY_VALUES = [
    'basic',
    'intermediate',
    'advanced',
    'expert',
    'master',
] as const;

export type TechProficiency = (typeof TECH_PROFICIENCY_VALUES)[number];
export type TechProficiencyGroup = 'basic' | 'intermediate' | 'advanced' | 'expert';
export type TechProficiencySliderValue = 1 | 2 | 3 | 4 | 5;

interface TechProficiencyGroupMeta {
    readonly label: string;
    readonly badgeClass: string;
    readonly minYears: number;
}

export interface TechProficiencyGroupViewModel<T> extends TechProficiencyGroupMeta {
    readonly key: TechProficiencyGroup;
    readonly techs: T[];
}

export const DEFAULT_TECH_PROFICIENCY: TechProficiency = 'intermediate';

export const TECH_PROFICIENCY_LABELS = {
    basic: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    expert: 'Experto',
    master: 'Experto',
} as const satisfies Record<TechProficiency, string>;

export const TECH_PROFICIENCY_SLIDER_VALUES = {
    basic: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5,
} as const satisfies Record<TechProficiency, TechProficiencySliderValue>;

export const TECH_PROFICIENCY_FROM_SLIDER = {
    1: 'basic',
    2: 'intermediate',
    3: 'advanced',
    4: 'expert',
    5: 'master',
} as const satisfies Record<TechProficiencySliderValue, TechProficiency>;

export const TECH_PROFICIENCY_GROUP_BY_VALUE = {
    basic: 'basic',
    intermediate: 'intermediate',
    advanced: 'advanced',
    expert: 'expert',
    master: 'expert',
} as const satisfies Record<TechProficiency, TechProficiencyGroup>;

export const TECH_PROFICIENCY_GROUP_ORDER = [
    'basic',
    'intermediate',
    'advanced',
    'expert',
] as const satisfies readonly TechProficiencyGroup[];

export const TECH_PROFICIENCY_GROUP_META = {
    basic: {
        label: 'Principiante',
        badgeClass: 'bg-muted text-foreground',
        minYears: 0,
    },
    intermediate: {
        label: 'Intermedio',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        minYears: 2,
    },
    advanced: {
        label: 'Avanzado',
        badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        minYears: 4,
    },
    expert: {
        label: 'Experto',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        minYears: 6,
    },
} as const satisfies Record<TechProficiencyGroup, TechProficiencyGroupMeta>;

export function isTechProficiency(value: string | null | undefined): value is TechProficiency {
    return typeof value === 'string' && value in TECH_PROFICIENCY_LABELS;
}

export function getTechProficiencyLabel(proficiency: string | null | undefined): string | null {
    if (!isTechProficiency(proficiency)) return null;

    return TECH_PROFICIENCY_LABELS[proficiency];
}

export function getTechProficiencyFromSlider(value: number): TechProficiency {
    if (value in TECH_PROFICIENCY_FROM_SLIDER) {
        return TECH_PROFICIENCY_FROM_SLIDER[value as TechProficiencySliderValue];
    }

    return DEFAULT_TECH_PROFICIENCY;
}

export function getTechProficiencySliderValue(
    proficiency: string | null | undefined,
): TechProficiencySliderValue {
    if (!isTechProficiency(proficiency)) return TECH_PROFICIENCY_SLIDER_VALUES.advanced;

    return TECH_PROFICIENCY_SLIDER_VALUES[proficiency];
}

export function getTechProficiencyGroupKey(
    proficiency: string | null | undefined,
    years: number | null,
): TechProficiencyGroup {
    if (isTechProficiency(proficiency)) {
        return TECH_PROFICIENCY_GROUP_BY_VALUE[proficiency];
    }

    if (years === null) {
        return 'basic';
    }

    for (let index = TECH_PROFICIENCY_GROUP_ORDER.length - 1; index >= 0; index -= 1) {
        const groupKey = TECH_PROFICIENCY_GROUP_ORDER[index];
        if (years >= TECH_PROFICIENCY_GROUP_META[groupKey].minYears) {
            return groupKey;
        }
    }

    return 'basic';
}

export function getTechProficiencyGroup(
    proficiency: string | null | undefined,
    years: number | null,
) {
    const key = getTechProficiencyGroupKey(proficiency, years);

    return {
        key,
        ...TECH_PROFICIENCY_GROUP_META[key],
    };
}

export function groupTechsByProficiency<T extends Pick<UserTech, 'years' | 'proficiency'>>(
    techs: readonly T[],
): Array<TechProficiencyGroupViewModel<T>> {
    const groups: Record<TechProficiencyGroup, T[]> = {
        basic: [],
        intermediate: [],
        advanced: [],
        expert: [],
    };

    for (const tech of techs) {
        const groupKey = getTechProficiencyGroupKey(tech.proficiency, tech.years);
        groups[groupKey].push(tech);
    }

    return TECH_PROFICIENCY_GROUP_ORDER
        .map((key) => ({
            key,
            ...TECH_PROFICIENCY_GROUP_META[key],
            techs: groups[key],
        }))
        .filter((group) => group.techs.length > 0);
}
