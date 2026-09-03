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
import {
    PROJECT_IDEA_CATEGORY_GRADIENTS,
    PROJECT_IDEA_CATEGORY_ICONS,
} from '@/lib/project-idea-catalog'
import { cn } from '@/lib/utils'
import type { ProjectIdea } from '@/types'

const MAX_VISIBLE_TECHS = 3

interface ProjectIdeaCardProps {
    idea: ProjectIdea
    techNames: string[]
    onSelect: (idea: ProjectIdea) => void
}

export function ProjectIdeaCard({ idea, techNames, onSelect }: ProjectIdeaCardProps) {
    const FallbackIcon = PROJECT_IDEA_CATEGORY_ICONS[idea.category]
    const gradient = PROJECT_IDEA_CATEGORY_GRADIENTS[idea.category]
    const visibleTechs = techNames.slice(0, MAX_VISIBLE_TECHS)
    const overflowCount = Math.max(techNames.length - MAX_VISIBLE_TECHS, 0)

    return (
        <Card role="group" aria-label={idea.title} className="h-full pt-0">
            <div className="relative aspect-video w-full overflow-hidden">
                {idea.illustrationUrl ? (
                    <img
                        src={idea.illustrationUrl}
                        alt={`Ilustración de la idea: ${idea.title}`}
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <div
                        className={cn(
                            'flex size-full items-center justify-center bg-gradient-to-br',
                            gradient,
                        )}
                    >
                        <FallbackIcon aria-hidden="true" className="size-10 text-foreground/60" />
                    </div>
                )}
            </div>

            <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription className="line-clamp-2" title={idea.summary}>
                    {idea.summary}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
                {idea.difficulty ? (
                    <Badge variant="secondary" className="capitalize">
                        {idea.difficulty}
                    </Badge>
                ) : null}

                {visibleTechs.length > 0 ? (
                    <ul className="flex flex-nowrap items-center gap-2 overflow-hidden">
                        {visibleTechs.map((name) => (
                            <li key={name} className="min-w-0">
                                <Badge variant="outline" className="max-w-full truncate">
                                    {name}
                                </Badge>
                            </li>
                        ))}
                        {overflowCount > 0 ? (
                            <li className="shrink-0">
                                <Badge variant="outline">+{overflowCount}</Badge>
                            </li>
                        ) : null}
                    </ul>
                ) : null}
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
