import { ExternalLink, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectLinksCardProps {
    repository_url?: string | null;
    demo_url?: string | null;
}

export function ProjectLinksCard({ repository_url, demo_url }: ProjectLinksCardProps) {
    if (!repository_url && !demo_url) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Enlaces</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {repository_url && (
                    <a
                        href={repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                        <GitBranch className="size-4" />
                        Ver Repositorio
                    </a>
                )}
                {demo_url && (
                    <a
                        href={demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                        <ExternalLink className="size-4" />
                        Ver Demo
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
