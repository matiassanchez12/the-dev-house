import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { Heart, Code2, Globe } from 'lucide-react';

interface LandingManifestoProps {
    className?: string;
}

export default function LandingManifesto({ className }: LandingManifestoProps) {
    const [ref, isInView] = useInView({ threshold: 0.2 });

    return (
        <section ref={ref} className={cn('py-20 bg-accent/15 relative overflow-hidden', className)}>
            {/* Accent background treatment */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />

            {/* Floating atmospheric orb */}
            <div className="absolute -top-24 -right-24 size-[500px] rounded-full bg-primary/10 blur-[100px] opacity-50 animate-float" />

            <div className="container mx-auto px-4 relative z-10">
                <div className={cn(
                    'max-w-3xl mx-auto text-center transition-all duration-700',
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )}>
                    {/* Manifesto icon */}
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-8">
                        <Heart className="size-8 text-primary" />
                    </div>

                    {/* Statement */}
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-foreground leading-tight">
                        Creemos que el mejor código se escribe juntos.
                    </h2>

                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Cada gran producto comenzó con alguien lo suficientemente valiente como para compartir una idea.
                            The Dev House existe para hacer ese momento más fácil — conectando desarrolladores
                            que tienen algo que construir con desarrolladores que tienen algo que contribuir.
                        </p>
                        <p>
                            No somos solo otra bolsa de trabajo o red social. Somos un lugar
                            donde ocurre la colaboración real. Donde los desarrolladores junior aprenden de los seniors,
                            donde los proyectos secundarios se convierten en startups, y donde el código que escribís juntos
                            es mejor que cualquier cosa que pudieras construir solo.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="flex flex-wrap justify-center gap-6 mt-12">
                        {[
                            { icon: Code2, label: 'Open Source Primero' },
                            { icon: Heart, label: 'Impulsado por la Comunidad' },
                            { icon: Globe, label: 'Construido por Desarrolladores' },
                        ].map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={value.label}
                                    className={cn(
                                        'flex items-center gap-2 text-sm font-medium text-foreground/70 transition-all duration-700',
                                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                                    )}
                                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                                >
                                    <Icon className="size-4 text-primary" />
                                    {value.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
