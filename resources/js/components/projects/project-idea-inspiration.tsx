import { useMemo } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { ProjectIdeaCategoryGroup } from '@/components/projects/project-idea-category-group'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { groupIdeasByCategory } from '@/lib/project-idea-catalog'
import type { ProjectIdea, Tech } from '@/types'

interface ProjectIdeaInspirationProps {
    ideas: ProjectIdea[]
    techs: Tech[]
    onSelect: (idea: ProjectIdea) => void
}

export function ProjectIdeaInspiration({ ideas, techs, onSelect }: ProjectIdeaInspirationProps) {
    const techNamesById = useMemo(() => {
        const map = new Map<number, string>()

        for (const tech of techs) {
            map.set(tech.id, tech.name)
        }

        return map
    }, [techs])

    const groups = useMemo(() => groupIdeasByCategory(ideas), [ideas])

    if (groups.length === 0) {
        return null
    }

    return (
        <Collapsible defaultOpen={false} className="flex flex-col gap-4 rounded-none border p-4">
            <div className="flex flex-col gap-1">
                <CollapsibleTrigger
                    render={
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-fit"
                            data-icon="inline-end"
                        />
                    }
                >
                    ¿Sin idea? Explorá ideas de proyectos
                    <ChevronDownIcon
                        data-icon="inline-end"
                        className="transition-transform group-aria-expanded/button:rotate-180"
                    />
                </CollapsibleTrigger>
                <p className="text-xs text-muted-foreground">
                    Elegí una idea para prellenar el formulario. Podés editar todo después.
                </p>
            </div>

            <CollapsibleContent className="flex flex-col gap-6">
                {groups.map((group) => (
                    <ProjectIdeaCategoryGroup
                        key={group.key}
                        label={group.label}
                        ideas={group.ideas}
                        techNamesById={techNamesById}
                        onSelect={onSelect}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}
