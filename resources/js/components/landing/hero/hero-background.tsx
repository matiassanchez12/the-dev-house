export function HeroBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.14] dark:opacity-[0.2]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 50% 50%, var(--muted-foreground) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    maskImage:
                        'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)',
                }}
            />

            <div className="absolute top-12 left-1/4 size-[26rem] -translate-x-1/2 rounded-full bg-primary/14 blur-3xl" />
            <div className="absolute right-1/4 bottom-12 size-[22rem] translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
        </div>
    )
}
