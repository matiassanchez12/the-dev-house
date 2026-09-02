import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import type { ProjectIdea } from '@/types'

interface ProjectIdeaCardProps {
    idea: ProjectIdea
    techNames: string[]
    onSelect: (idea: ProjectIdea) => void
}

export function ProjectIdeaCard({ idea, techNames, onSelect }: ProjectIdeaCardProps) {
    return (
        <Card role="group" aria-label={idea.title} className="h-full">
            <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription>{idea.summary}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                {idea.difficulty && (
                    <Badge variant="secondary" className="capitalize">
                        {idea.difficulty}
                    </Badge>
                )}

                {techNames.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                        {techNames.map((name) => (
                            <li key={name}>
                                <Badge variant="outline">{name}</Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    type="button"
                    size="sm"
                    aria-label={`Usar la idea: ${idea.title}`}
                    onClick={() => onSelect(idea)}
                >
                    Usar esta idea
                </Button>
            </CardFooter>
        </Card>
    )
}
