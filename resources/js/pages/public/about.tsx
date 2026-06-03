import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import LandingNav from '@/components/landing/landing-nav';
import LandingFooter from '@/components/landing/landing-footer';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { Users, GraduationCap, Rocket, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    auth: { user: { id: number; name: string } | null };
}

const values = [
    {
        icon: Users,
        title: 'Colaborar',
        description:
            'Conectá con desarrolladores que complementen tus skills. Nadie construye solo un gran proyecto.',
    },
    {
        icon: GraduationCap,
        title: 'Aprender',
        description:
            'Cada proyecto es una oportunidad para crecer. Codeá con gente que sabe más que vos y enseñá lo que ya dominás.',
    },
    {
        icon: Rocket,
        title: 'Lanzar',
        description:
            'Pasá de la idea al producto real. Publicá, iterate y mostrá resultados concretos en tu portafolio.',
    },
];

export default function About({ auth }: Props) {
    const [heroRef, heroInView] = useInView({ threshold: 0.2 });
    const [valuesRef, valuesInView] = useInView({ threshold: 0.1 });

    return (
        <>
            <Seo title="Acerca de" description="Conocé The Dev House: la plataforma colaborativa para desarrolladores de todos los niveles. Creá proyectos, unite a equipos y construí software en comunidad." />
            <div className="min-h-screen bg-background">
                <LandingNav auth={auth} />

                {/* Hero */}
                <section
                    ref={heroRef}
                    className="relative pt-32 pb-20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background pointer-events-none" />
                    <div className="container mx-auto px-4 relative">
                        <div
                            className={cn(
                                'max-w-3xl mx-auto text-center transition-all duration-700',
                                heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            )}
                        >
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                Donde los desarrolladores{' '}
                                <span className="text-accent-foreground bg-accent px-2">construyen juntos</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                The Dev House es una plataforma colaborativa para desarrolladores de todos los niveles.
                                Creá proyectos, unite a equipos y construí software en comunidad.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Propuesta de valor */}
                <section ref={valuesRef} className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {values.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className={cn(
                                            'bg-background border border-border rounded-lg p-8 text-center transition-all duration-700 hover:shadow-md',
                                            valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                        )}
                                        style={{ transitionDelay: `${index * 150}ms` }}
                                    >
                                        <div className="inline-flex items-center justify-center size-14 rounded-xl bg-accent/10 mb-5">
                                            <Icon className="size-7 text-accent-foreground/70" />
                                        </div>
                                        <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Misión */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-16">
                                <HeartHandshake className="size-10 text-primary mx-auto mb-4" />
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Nuestra misión
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Que ningún desarrollador tenga que construir solo. Creemos que el mejor software
                                    nace de la colaboración, la diversidad de perspectivas y el deseo genuino de
                                    compartir conocimiento. Acá no importa si estás arrancando o si tenés 10 años de
                                    experiencia — siempre hay algo que aprender y algo que enseñar.
                                </p>
                            </div>

                            <div className="bg-muted/30 border border-border rounded-lg p-8">
                                <h3 className="font-display text-xl font-semibold text-foreground mb-4 text-center">
                                    Cómo funciona la comunidad
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        {
                                            title: '1. Descubrí o creá un proyecto',
                                            desc: 'Explorá proyectos abiertos o publicá tu idea. Definí tecnologías, objetivos y el perfil de colaborador que buscás.',
                                        },
                                        {
                                            title: '2. Sumate a un equipo',
                                            desc: 'Envía una solicitud para unirte a un proyecto que te interese. El creador te acepta y arrancan a codear juntos.',
                                        },
                                        {
                                            title: '3. Iterá y publicá',
                                            desc: 'Trabajen en conjunto, usen el chat integrado, dividan tareas y lleguen a un MVP. Después publiquenlo y reciban feedback.',
                                        },
                                    ].map((item) => (
                                        <div key={item.title} className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="size-2 rounded-full bg-accent" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-accent/5 border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Sumate a la comunidad
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
                            Sea cual sea tu nivel, hay un proyecto esperando por vos.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href={route('projects.index')}>
                                <Button variant="secondary" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Ver proyectos
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button variant="outline" size="lg">
                                    Unirme ahora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
