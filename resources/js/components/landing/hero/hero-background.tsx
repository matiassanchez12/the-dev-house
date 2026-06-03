export function HeroBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.12] dark:opacity-[0.18]"
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

            <div className="absolute top-10 left-1/4 size-96 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute right-1/4 bottom-10 size-72 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
    );
}

