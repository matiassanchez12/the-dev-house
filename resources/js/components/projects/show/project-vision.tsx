import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectVisionProps {
    vision: string | null | undefined;
}

export function ProjectVision({ vision }: ProjectVisionProps) {
    if (!vision) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Visión del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground whitespace-pre-line">
                    {vision}
                </p>
            </CardContent>
        </Card>
    );
}
