import type { HeroHeadlineProps } from './types'

export function HeroHeadline({ userCount }: HeroHeadlineProps) {
    return (
        <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span>+{userCount.toLocaleString()} developers building now</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Construí con otros developers
                <br />
                <span className="text-primary">y lanzá tu propio proyecto hoy</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                The Dev House conecta developers para descubrir proyectos reales, encontrar
                colaboradores y construir con tracción desde el primer paso.
            </p>
        </div>
    )
}
