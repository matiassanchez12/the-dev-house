import { Badge } from '@/components/ui/badge';
import { UserTech } from '@/types';

interface TechShowcaseProps {
    techs: UserTech[];
}

const proficiencyConfig = [
    { min: 6, label: 'Experto', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { min: 4, label: 'Avanzado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { min: 2, label: 'Intermedio', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { min: 0, label: 'Principiante', className: 'bg-muted text-foreground dark:bg-muted dark:text-muted-foreground' },
];

function getProficiency(years: number | null) {
    if (years === null) return null;
    return proficiencyConfig.find((c) => years >= c.min);
}

export function TechShowcase({ techs }: TechShowcaseProps) {
    if (techs.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
                {techs.map((tech) => {
                    const proficiency = getProficiency(tech.years);
                    const yearsLabel = tech.years !== null ? `${tech.years} año${tech.years !== 1 ? 's' : ''}` : null;

                    return (
                        <Badge key={tech.id} variant="secondary">
                            {tech.name}
                            {yearsLabel && (
                                <span className="ms-1 opacity-70">
                                    • {yearsLabel}
                                </span>
                            )}
                            {proficiency && (
                                <span className={`ms-1 px-1 rounded text-xs ${proficiency.className}`}>
                                    {proficiency.label}
                                </span>
                            )}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
