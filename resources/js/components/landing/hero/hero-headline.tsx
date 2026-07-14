import type { HeroHeadlineProps } from './types'

export function HeroHeadline({ userCount }: HeroHeadlineProps) {
    return (
        <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Construí con otros developers
                <br />
                <span className="text-primary">y lanzá tu propio proyecto hoy</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto">
                The Dev House conecta developers para descubrir proyectos reales, encontrar
                colaboradores y construir con tracción desde el primer paso.
            </p>
        </div>
    )
}
