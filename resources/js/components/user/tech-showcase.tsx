import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserTech } from '@/types';
import {
    groupTechsByProficiency,
} from '@/lib/tech-proficiency';

interface TechShowcaseProps {
    techs: UserTech[];
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
                                <Badge key={tech.id} variant="secondary" className={group.badgeClass}>
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
