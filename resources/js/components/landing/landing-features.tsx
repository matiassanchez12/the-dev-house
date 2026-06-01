import { Link, ArrowRight, Rocket, Users, MessageSquare } from "lucide-react";
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { Button } from "../ui/button";

const featureItems = [
    {
        icon: Rocket,
        title: 'Creá tu Proyecto',
        description: 'Compartí tu idea y encontrá desarrolladores talentosos para hacerla realidad',
    },
    {
        icon: Users,
        title: 'Unite a Equipos',
        description: 'Explorá proyectos y unite a aquellos que se alinean con tus habilidades e intereses',
    },
    {
        icon: MessageSquare,
        title: 'Comunicación Fluida',
        description: 'Chat integrado y sistema de solicitudes para coordinar con tu equipo',
    },
];

export default function LandingFeatures() {
    const [ref, isInView] = useInView({ threshold: 0.2 });

    return (
        <section ref={ref} id="features" className="bg-accent/30 py-20">
            <div className="container mx-auto px-4">
                <div className={cn(
                    'text-center mb-12 transition-all duration-700',
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )}>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">¿Por qué unirte?</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Todo lo que necesitás para colaborar en proyectos de desarrollo
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featureItems.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                'text-center p-6 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-700',
                                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            )}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
                                <feature.icon className="size-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}

                    <div className={cn(
                        'col-span-1 md:col-span-3 flex items-center justify-center w-full transition-all duration-700',
                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                    )} style={{ transitionDelay: '450ms' }}>
                        <Link href={route('register')}>
                            <Button size="lg" className="text-lg px-8 bg-accent text-accent-foreground hover:bg-accent/90">
                                Crear Cuenta Gratis
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}