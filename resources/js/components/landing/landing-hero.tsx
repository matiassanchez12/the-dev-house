import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { HeroBackground, HeroTechBackground, HeroHeadline, HeroWordmark, HeroCta } from './hero';
import { LandingHeroProps } from './hero/types';


interface InViewItemProps {
    children: ReactNode;
    /** Stagger delay in ms before animation starts */
    delayMs?: number;
    className?: string;
}

function InViewItem({ children, delayMs = 0, className }: InViewItemProps) {
    return (
        <div
            className={cn('motion-safe:animate-fade-in-up', className)}
            style={{ animationDelay: `${delayMs}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}

export default function LandingHero({ auth, techs, className }: LandingHeroProps) {
    return (
        <section className={cn('relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32', className)}>
            <HeroBackground />
            <HeroTechBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex justify-center flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left max-w-2xl space-y-4">
                        <InViewItem delayMs={0}>
                            <HeroHeadline />
                        </InViewItem>

                        <InViewItem delayMs={80}>
                            <HeroWordmark />
                        </InViewItem>

                        <InViewItem delayMs={160}>
                            <HeroCta auth={auth} />
                        </InViewItem>
                    </div>
                </div>
            </div>
        </section>
    );
}
