import { describe, expect, it } from 'vitest';
import {
    DEFAULT_TECH_PROFICIENCY,
    TECH_PROFICIENCY_FROM_SLIDER,
    TECH_PROFICIENCY_GROUP_ORDER,
    TECH_PROFICIENCY_LABELS,
    TECH_PROFICIENCY_SLIDER_VALUES,
    getTechProficiencyFromSlider,
    getTechProficiencyLabel,
    getTechProficiencySliderValue,
    groupTechsByProficiency,
} from './tech-proficiency';

describe('tech proficiency helpers', () => {
    it('keeps canonical labels aligned with frontend presentation', () => {
        expect(TECH_PROFICIENCY_LABELS.basic).toBe('Principiante');
        expect(TECH_PROFICIENCY_LABELS.intermediate).toBe('Intermedio');
        expect(TECH_PROFICIENCY_LABELS.advanced).toBe('Avanzado');
        expect(TECH_PROFICIENCY_LABELS.expert).toBe('Experto');
        expect(TECH_PROFICIENCY_LABELS.master).toBe('Experto');
        expect(getTechProficiencyLabel(null)).toBeNull();
    });

    it('maps slider values and proficiency values both ways', () => {
        expect(getTechProficiencySliderValue('advanced')).toBe(3);
        expect(getTechProficiencySliderValue(null)).toBe(3);
        expect(getTechProficiencyFromSlider(5)).toBe('master');
        expect(getTechProficiencyFromSlider(0)).toBe(DEFAULT_TECH_PROFICIENCY);
        expect(TECH_PROFICIENCY_SLIDER_VALUES.master).toBe(5);
        expect(TECH_PROFICIENCY_FROM_SLIDER[4]).toBe('expert');
    });

    it('groups master proficiency under the expert display tier', () => {
        const groups = groupTechsByProficiency([
            { years: 7, proficiency: 'master' },
            { years: 2, proficiency: 'intermediate' },
        ]);

        expect(groups.map((group) => group.key)).toEqual(['intermediate', 'expert']);
        expect(groups.map((group) => group.label)).toEqual(['Intermedio', 'Experto']);
        expect(TECH_PROFICIENCY_GROUP_ORDER).toEqual(['basic', 'intermediate', 'advanced', 'expert']);
        expect(groups[1].techs[0].proficiency).toBe('master');
    });
});
