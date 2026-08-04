import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    DEFAULT_TECH_PROFICIENCY,
    getTechProficiencyLabel,
    getTechProficiencySliderValue,
} from '@/lib/tech-proficiency'
import { groupTechsByCategory } from '@/lib/tech-catalog'
import type { Tech } from '@/types'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { Fragment, useState } from 'react'
import {
    type ProfileTechFormEntry,
    TECH_PROFICIENCY_SLIDER_MAX,
    TECH_PROFICIENCY_SLIDER_MIN,
    TECH_YEARS_MAX,
    TECH_YEARS_MIN,
    TECH_YEARS_STEP,
} from './profile-tech-form'

interface ProfileTechSelectorProps {
    allTechs: Tech[]
    error?: string
    selectedTechs: ProfileTechFormEntry[]
    onToggleTech: (techId: number, checked: boolean) => void
    onUpdateTech: (
        techId: number,
        field: 'years_experience' | 'proficiency',
        value: string | number,
    ) => void
}

type TechGroup = ReturnType<typeof groupTechsByCategory>[number]

export default function ProfileTechSelector({
    allTechs,
    error,
    selectedTechs,
    onToggleTech,
    onUpdateTech,
}: ProfileTechSelectorProps) {
    const techGroups = groupTechsByCategory(allTechs)
    const techById = new Map(allTechs.map((tech) => [tech.id, tech]))
    const selectedTechIds = new Set(selectedTechs.map((tech) => tech.id))
    const [expandedGroups, setExpandedGroups] = useState(
        () =>
            new Set(
            ),
    )

    return (
        <div className="flex flex-col gap-4">
            {selectedTechs.length > 0 ? (
                <SelectedTechSummary
                    selectedTechs={selectedTechs}
                    techById={techById}
                    onRemoveTech={(techId) => onToggleTech(techId, false)}
                />
            ) : null}

            <div className="flex flex-col gap-3">
                {techGroups.map((group) => {
                    const selectedCount = group.techs.filter((tech) =>
                        selectedTechIds.has(tech.id),
                    ).length
                    const groupIsExpanded = expandedGroups.has(group.key)

                    return (
                        <TechCategoryCard
                            key={group.key}
                            group={group}
                            isExpanded={groupIsExpanded}
                            selectedCount={selectedCount}
                            selectedTechs={selectedTechs}
                            onToggleGroup={() => {
                                setExpandedGroups((currentGroups) => {
                                    const nextGroups = new Set(currentGroups)

                                    if (groupIsExpanded) {
                                        nextGroups.delete(group.key)
                                    } else {
                                        nextGroups.add(group.key)
                                    }

                                    return nextGroups
                                })
                            }}
                            onToggleTech={onToggleTech}
                            onUpdateTech={onUpdateTech}
                        />
                    )
                })}
            </div>

            <FormError message={error} />
        </div>
    )
}

interface SelectedTechSummaryProps {
    selectedTechs: ProfileTechFormEntry[]
    techById: Map<number, Tech>
    onRemoveTech: (techId: number) => void
}

function SelectedTechSummary({ selectedTechs, techById, onRemoveTech }: SelectedTechSummaryProps) {
    return (
        <Card size="sm">
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                    {getSelectedCountText(selectedTechs.length)}
                </p>
                <div className="flex flex-wrap gap-2">
                    {selectedTechs.map((tech) => {
                        const techName = getTechName(techById, tech.id)

                        return (
                            <Badge
                                key={tech.id}
                                variant="secondary"
                                className="h-auto gap-1.5 py-1"
                            >
                                <span>{techName}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Quitar ${techName}`}
                                    className="-me-1"
                                    onClick={() => onRemoveTech(tech.id)}
                                >
                                    <XIcon />
                                </Button>
                            </Badge>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

interface TechCategoryCardProps {
    group: TechGroup
    isExpanded: boolean
    selectedCount: number
    selectedTechs: ProfileTechFormEntry[]
    onToggleGroup: () => void
    onToggleTech: (techId: number, checked: boolean) => void
    onUpdateTech: (
        techId: number,
        field: 'years_experience' | 'proficiency',
        value: string | number,
    ) => void
}

function TechCategoryCard({
    group,
    isExpanded,
    selectedCount,
    selectedTechs,
    onToggleGroup,
    onToggleTech,
    onUpdateTech,
}: TechCategoryCardProps) {
    const sectionId = `tech-group-${group.key}`
    return (
        <Card size="sm">
            <CardHeader>
                <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between px-0 py-0 text-left whitespace-normal"
                    aria-controls={sectionId}
                    aria-expanded={isExpanded}
                    onClick={onToggleGroup}
                >
                    <span className="flex min-w-0 flex-col gap-1 text-left">
                        <span className="text-sm font-medium text-foreground">{group.label}</span>
                        <span className="text-xs text-muted-foreground">
                            ({group.techs.length} tecnología{group.techs.length === 1 ? '' : 's'})
                        </span>
                    </span>
                    <span className="flex items-center gap-2">
                        {selectedCount > 0 ? (
                            <Badge variant="secondary">
                                {selectedCount} seleccionada{selectedCount === 1 ? '' : 's'}
                            </Badge>
                        ) : null}
                        <ChevronDownIcon
                            data-icon="inline-end"
                            className={cn('transition-transform', isExpanded && 'rotate-180')}
                        />
                    </span>
                </Button>
            </CardHeader>

            {isExpanded ? (
                <>
                    <Separator />
                    <CardContent id={sectionId} className="flex flex-col gap-0">
                        {group.techs.map((tech, index) => {
                            const selectedTech = selectedTechs.find((item) => item.id === tech.id)

                            return (
                                <Fragment key={tech.id}>
                                    <TechSelectionItem
                                        tech={tech}
                                        selectedTech={selectedTech}
                                        onToggleTech={onToggleTech}
                                        onUpdateTech={onUpdateTech}
                                    />
                                    {index < group.techs.length - 1 ? <Separator /> : null}
                                </Fragment>
                            )
                        })}
                    </CardContent>
                </>
            ) : null}
        </Card>
    )
}

interface TechSelectionItemProps {
    tech: Tech
    selectedTech?: ProfileTechFormEntry
    onToggleTech: (techId: number, checked: boolean) => void
    onUpdateTech: (
        techId: number,
        field: 'years_experience' | 'proficiency',
        value: string | number,
    ) => void
}

function TechSelectionItem({
    tech,
    selectedTech,
    onToggleTech,
    onUpdateTech,
}: TechSelectionItemProps) {
    const isSelected = selectedTech !== undefined
    const checkboxId = `tech-${tech.id}-selected`
    const labelId = `tech-${tech.id}-label`
    const detailsId = `tech-${tech.id}-details`
    const yearsInputId = `tech-${tech.id}-years`
    const proficiencyInputId = `tech-${tech.id}-proficiency`
    const proficiencyLabel =
        getTechProficiencyLabel(selectedTech?.proficiency) ??
        getTechProficiencyLabel(DEFAULT_TECH_PROFICIENCY)

    return (
        <div className="flex flex-col gap-3 py-4">
            <div className="flex items-start justify-between gap-3">
                <label htmlFor={checkboxId} className="flex min-w-0 flex-1 items-start gap-3">
                    <Checkbox
                        id={checkboxId}
                        checked={isSelected}
                        aria-labelledby={labelId}
                        aria-controls={detailsId}
                        aria-expanded={isSelected}
                        onCheckedChange={(checked) => onToggleTech(tech.id, checked === true)}
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                        <span
                            id={labelId}
                            className={cn(
                                'text-sm text-foreground',
                                isSelected ? 'font-medium' : 'text-muted-foreground',
                            )}
                        >
                            {tech.name}
                        </span>
                    </span>
                </label>

                {isSelected && proficiencyLabel ? (
                    <Badge variant="outline">{proficiencyLabel}</Badge>
                ) : null}
            </div>

            {isSelected ? (
                <div
                    id={detailsId}
                    aria-labelledby={labelId}
                    className="grid gap-3 rounded-none bg-muted/40 p-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)]"
                >
                    <Field id={yearsInputId} label="Años de experiencia" labelClassName="sr-only">
                        <Input
                            type="number"
                            min={TECH_YEARS_MIN}
                            max={TECH_YEARS_MAX}
                            step={TECH_YEARS_STEP}
                            value={selectedTech.years_experience}
                            onChange={(event) =>
                                onUpdateTech(tech.id, 'years_experience', event.target.value)
                            }
                            placeholder="Ej: 3"
                            aria-label={`Años de experiencia en ${tech.name}`}
                        />
                    </Field>

                    <div className="flex flex-col gap-2">
                        <Field
                            id={proficiencyInputId}
                            label="Nivel de experiencia"
                            labelClassName="sr-only"
                        >
                            <input
                                type="range"
                                min={TECH_PROFICIENCY_SLIDER_MIN}
                                max={TECH_PROFICIENCY_SLIDER_MAX}
                                value={getTechProficiencySliderValue(selectedTech.proficiency)}
                                onChange={(event) =>
                                    onUpdateTech(
                                        tech.id,
                                        'proficiency',
                                        Number.parseInt(event.target.value, 10),
                                    )
                                }
                                className="w-full accent-primary"
                                aria-label={`Nivel de experiencia en ${tech.name}`}
                                aria-valuetext={proficiencyLabel ?? undefined}
                            />
                        </Field>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Principiante</span>
                            <span>Experto</span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function getSelectedCountText(count: number) {
    return `${count} tecnología${count === 1 ? '' : 's'} seleccionada${count === 1 ? '' : 's'}`
}

function getTechName(techById: Map<number, Tech>, techId: number) {
    return techById.get(techId)?.name ?? `Tecnología ${techId}`
}
