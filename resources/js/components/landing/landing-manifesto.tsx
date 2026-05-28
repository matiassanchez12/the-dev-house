import { cn } from '@/lib/utils';
import { Heart, Code2, Globe } from 'lucide-react';

interface LandingManifestoProps {
    className?: string;
}

export default function LandingManifesto({ className }: LandingManifestoProps) {
    return (
        <section className={cn('py-20 bg-accent/5 relative overflow-hidden', className)}>
            {/* Accent background treatment */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Manifesto icon */}
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-accent/10 mb-8">
                        <Heart className="size-8 text-accent" />
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
                            donde los proyectos secundarios se convierten en startups, y donde el código que escribes juntos
                            es mejor que cualquier cosa que pudieras construir solo.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="flex flex-wrap justify-center gap-6 mt-12">
                        {[
                            { icon: Code2, label: 'Open Source Primero' },
                            { icon: Heart, label: 'Impulsado por la Comunidad' },
                            { icon: Globe, label: 'Construido por Desarrolladores' },
                        ].map((value) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={value.label}
                                    className="flex items-center gap-2 text-sm font-medium text-foreground/70"
                                >
                                    <Icon className="size-4 text-accent" />
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
