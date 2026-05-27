import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tech } from '@/types';

interface ProjectTechsCardProps {
    techs: Tech[];
}

export function ProjectTechsCard({ techs }: ProjectTechsCardProps) {
    if (techs.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Tecnologías</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {techs.map((tech) => (
                        <Badge key={tech.id} variant="secondary">
                            {tech.name}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
