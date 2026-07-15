import type { HeroWordmarkProps } from './types'
import { cn } from '@/lib/utils'

export function HeroWordmark({ className }: HeroWordmarkProps) {
    return (
        <div className={cn('inline-flex flex-col items-center gap-2 text-center', className)}>
        </div>
    )
}
