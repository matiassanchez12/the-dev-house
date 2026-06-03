import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { HeroBackground } from './hero/hero-background';
import { HeroHeadline } from './hero/hero-headline';
import { HeroWordmark } from './hero/hero-wordmark';
import { HeroTechGrid } from './hero/hero-tech-grid';
import { HeroCta } from './hero/hero-cta';
import type { LandingHeroProps } from './hero/types';

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

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left max-w-2xl">
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

                    <InViewItem delayMs={240} className="flex-shrink-0 w-full md:w-auto">
                        <HeroTechGrid techs={techs} />
                    </InViewItem>
                </div>
            </div>
        </section>
    );
}
