import type { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { HeroBackground, HeroTechBackground, HeroHeadline, HeroWordmark, HeroCta } from './hero'
import { LandingHeroProps } from './hero/types'

interface InViewItemProps {
    children: ReactNode
    /** Stagger delay in ms before animation starts */
    delayMs?: number
    className?: string
}

function InViewItem({ children, delayMs = 0, className }: InViewItemProps) {
    return (
        <div
            className={cn('motion-safe:animate-fade-in-up', className)}
            style={{ animationDelay: `${delayMs}ms` } as CSSProperties}
        >
            {children}
        </div>
    )
}

export default function LandingHero({ auth, user_count, techs, className }: LandingHeroProps) {
    return (
        <section
            className={cn(
                'group relative overflow-x-hidden overflow-y-visible min-h-[calc(100vh-1px)] flex items-center',
                'pt-20 pb-16 md:pt-32 md:pb-24',
                className,
            )}
        >
            <HeroBackground />
            <HeroTechBackground />

            <div className="container mx-auto px-4 relative z-10 w-full">
                <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-7">
                    <InViewItem delayMs={0}>
                        <HeroHeadline userCount={user_count} />
                    </InViewItem>

                    <InViewItem delayMs={80}>
                        <HeroWordmark />
                    </InViewItem>

                    <InViewItem delayMs={160}>
                        <HeroCta auth={auth} />
                    </InViewItem>
                </div>
            </div>
        </section>
    )
}
