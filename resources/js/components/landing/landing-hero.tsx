import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { useInViewOnce } from './hero/hooks/use-in-view-once';
import { usePrefersReducedMotion } from './hero/hooks/use-prefers-reduced-motion';
import { HeroBackground } from './hero/hero-background';
import { HeroHeadline } from './hero/hero-headline';
import { HeroWordmark } from './hero/hero-wordmark';
import { HeroTechGrid } from './hero/hero-tech-grid';
import { HeroCta } from './hero/hero-cta';
import type { LandingHeroProps } from './hero/types';

interface InViewItemProps {
    /** Children to render inside the animated wrapper */
    children: ReactNode;
    /** Whether entrance animation should play */
    shouldAnimate: boolean;
    /** Stagger delay in ms (default: 0) */
    delayMs?: number;
    /** Additional classes forwarded to the div */
    className?: string;
}

function InViewItem({ children, shouldAnimate, delayMs = 0, className }: InViewItemProps) {
    return (
        <div
            className={cn(shouldAnimate && 'motion-safe:animate-fade-in-up', className)}
            style={shouldAnimate ? { animationDelay: `${delayMs}ms` } as CSSProperties : undefined}
        >
            {children}
        </div>
    );
}

export default function LandingHero({ auth, techs, className }: LandingHeroProps) {
    const sectionRef = useInViewOnce<HTMLElement>({ rootMargin: '-100px 0px' });
    const [inView] = sectionRef;
    const isReduced = usePrefersReducedMotion();
    const shouldAnimate = inView && !isReduced;

    return (
        <section
            ref={sectionRef.current as React.RefObject<HTMLElement>}
            className={cn(
                'relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32',
                className,
            )}
        >
            <HeroBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left max-w-2xl">
                        <InViewItem shouldAnimate={shouldAnimate} delayMs={0}>
                            <HeroHeadline />
                        </InViewItem>

                        <InViewItem shouldAnimate={shouldAnimate} delayMs={80}>
                            <HeroWordmark />
                        </InViewItem>

                        <InViewItem shouldAnimate={shouldAnimate} delayMs={160}>
                            <HeroCta auth={auth} />
                        </InViewItem>
                    </div>

                    <InViewItem
                        shouldAnimate={shouldAnimate}
                        delayMs={240}
                        className="flex-shrink-0 w-full md:w-auto"
                    >
                        <HeroTechGrid techs={techs} />
                    </InViewItem>
                </div>
            </div>
        </section>
    );
}
