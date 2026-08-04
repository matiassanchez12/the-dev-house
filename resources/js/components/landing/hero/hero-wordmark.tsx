import type { HeroWordmarkProps } from './types'
import { cn } from '@/lib/utils'

export function HeroWordmark({ className }: HeroWordmarkProps) {
    return (
        <div className={cn('inline-flex flex-col items-center gap-2 text-center', className)}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                The Dev House
            </span>
            <span className="text-sm text-foreground/80">Build with intent</span>
        </div>
    )
}
