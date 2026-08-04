import { Separator } from '@/components/ui/separator'
import { type ReactNode, useId } from 'react'

interface ProfileSectionProps {
    title: string
    children: ReactNode
}

export default function ProfileSection({ title, children }: ProfileSectionProps) {
    const titleId = useId()

    return (
        <section aria-labelledby={titleId} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <h2 id={titleId} className="text-lg font-semibold text-foreground sm:text-xl">
                    {title}
                </h2>
                <Separator />
            </div>

            <div className="grid gap-6">{children}</div>
        </section>
    )
}
