import { ProjectIdeaCard } from '@/components/projects/project-idea-card'
import type { ProjectIdea } from '@/types'

interface ProjectIdeaCategoryGroupProps {
    label: string
    ideas: ProjectIdea[]
    techNamesById: Map<number, string>
    onSelect: (idea: ProjectIdea) => void
}

export function ProjectIdeaCategoryGroup({
    label,
    ideas,
    techNamesById,
    onSelect,
}: ProjectIdeaCategoryGroupProps) {
    if (ideas.length === 0) {
        return null
    }

    return (
        <section className="flex flex-col gap-3" aria-label={label}>
            <h3 className="text-sm font-medium text-foreground">{label}</h3>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea) => (
                    <li key={idea.slug}>
                        <ProjectIdeaCard
                            idea={idea}
                            techNames={idea.techIds
                                .map((id) => techNamesById.get(id))
                                .filter((name): name is string => Boolean(name))}
                            onSelect={onSelect}
                        />
                    </li>
                ))}
            </ul>
        </section>
    )
}
