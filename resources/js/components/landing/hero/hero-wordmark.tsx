import type { HeroWordmarkProps } from './types';

export function HeroWordmark({ className }: HeroWordmarkProps) {
    return (
        <div
            className={`font-mono text-center text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${className ?? ''}`}
        >
            <div className="text-foreground">The Dev House</div>
            <div className="mt-1 text-sm md:text-base font-normal text-muted-foreground opacity-60">
                // donde los devs construyen juntos
            </div>
        </div>
    );
}
