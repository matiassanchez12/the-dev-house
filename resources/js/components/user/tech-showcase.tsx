import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserTech } from '@/types';

interface TechShowcaseProps {
    techs: UserTech[];
}

const proficiencyLevels = [
    { min: 6, label: 'Experto', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { min: 4, label: 'Avanzado', badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { min: 2, label: 'Intermedio', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { min: 0, label: 'Principiante', badgeClass: 'bg-muted text-foreground' },
];

function getProficiencyLevel(years: number | null) {
    if (years === null) return proficiencyLevels[proficiencyLevels.length - 1];
    return proficiencyLevels.find((c) => years >= c.min) ?? proficiencyLevels[proficiencyLevels.length - 1];
}

function groupTechsByProficiency(techs: UserTech[]) {
    const groups: Record<string, UserTech[]> = {};
    for (const level of proficiencyLevels) {
        groups[level.label] = [];
    }
    for (const tech of techs) {
        const level = getProficiencyLevel(tech.years);
        groups[level.label].push(tech);
    }
    return proficiencyLevels
        .map((level) => ({ ...level, techs: groups[level.label] }))
        .filter((group) => group.techs.length > 0);
}

function SectionLabel({ children }: { children: string }) {
    return (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {children}
        </span>
    );
}

export function TechShowcase({ techs }: TechShowcaseProps) {
    if (techs.length === 0) return null;

    const grouped = groupTechsByProficiency(techs);

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-foreground">Tecnologías</h3>
            {grouped.map((group, index) => (
                <div key={group.label} className="flex flex-col gap-2">
                    <SectionLabel>{group.label}</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        {group.techs.map((tech) => {
                            const yearsLabel = tech.years !== null
                                ? `${tech.years} año${tech.years !== 1 ? 's' : ''}`
                                : null;

                            return (
                                <Badge key={tech.id} variant="secondary">
                                    {tech.name}
                                    {yearsLabel && (
                                        <span className="ms-1 opacity-70">
                                            &middot; {yearsLabel}
                                        </span>
                                    )}
                                </Badge>
                            );
                        })}
                    </div>
                    {index < grouped.length - 1 && <Separator />}
                </div>
            ))}
        </div>
    );
}
