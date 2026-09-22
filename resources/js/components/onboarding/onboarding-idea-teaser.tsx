import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectIdea } from '@/types'

export type FeaturedIdea = ProjectIdea

interface OnboardingIdeaTeaserProps {
    ideas: FeaturedIdea[]
    selectedSlug: string | null
    onSelect: (slug: string | null) => void
    techNamesById: Map<number, string>
}

const MAX_TECH_CHIPS = 3

export function OnboardingIdeaTeaser({
    ideas,
    selectedSlug,
    onSelect,
    techNamesById,
}: OnboardingIdeaTeaserProps) {
    if (ideas.length === 0) {
        return null
    }

    return (
        <section className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">
                    ¿Preferís arrancar tu propia idea?
                </h3>
                <a
                    href="/projects/create"
                    className="text-xs text-muted-foreground underline"
                >
                    ver todas las ideas
                </a>
            </div>

            <RadioGroup
                aria-label="Ideas de proyecto destacadas"
                value={selectedSlug ?? ''}
                onValueChange={(value) =>
                    onSelect(value ? String(value) : null)
                }
                className="flex flex-col gap-2"
            >
                {ideas.map((idea) => {
                    const isSelected = idea.slug === selectedSlug
                    const techNames = idea.techIds
                        .map((id) => techNamesById.get(id))
                        .filter((name): name is string => Boolean(name))
                    const visibleTechNames = techNames.slice(0, MAX_TECH_CHIPS)
                    const overflowCount = techNames.length - visibleTechNames.length

                    return (
                        <label
                            key={idea.slug}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors',
                                isSelected && 'border-primary bg-primary/5',
                            )}
                        >
                            <Radio.Root
                                value={idea.slug}
                                onClick={() => {
                                    if (isSelected) {
                                        onSelect(null)
                                    }
                                }}
                                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input data-checked:border-primary"
                            >
                                <Radio.Indicator className="size-2 rounded-full bg-primary" />
                            </Radio.Root>

                            <div className="flex flex-1 flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {idea.title}
                                    </span>
                                    {idea.difficulty && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs capitalize"
                                        >
                                            {idea.difficulty}
                                        </Badge>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {idea.summary}
                                </p>
                                {visibleTechNames.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {visibleTechNames.map((name) => (
                                            <Badge
                                                key={name}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {name}
                                            </Badge>
                                        ))}
                                        {overflowCount > 0 && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                +{overflowCount}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </label>
                    )
                })}
            </RadioGroup>
        </section>
    )
}
