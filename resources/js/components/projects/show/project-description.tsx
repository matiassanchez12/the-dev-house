import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectDescriptionProps {
    description: string;
}

export function ProjectDescription({ description }: ProjectDescriptionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground whitespace-pre-line">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
