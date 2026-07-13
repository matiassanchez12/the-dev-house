import type { HeroWordmarkProps } from './types'
import { cn } from '@/lib/utils'

export function HeroWordmark({ className }: HeroWordmarkProps) {
    return (
        <div className={cn('inline-flex flex-col items-center gap-2 text-center', className)}>
            <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/70 px-4 py-2 backdrop-blur-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.45em] text-foreground">
                    The Dev House
                </span>
                <span className="h-px w-8 bg-primary/40" aria-hidden="true" />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Build with intent</div>
        </div>
    )
}
