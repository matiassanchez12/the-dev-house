import Seo from '@/components/seo';
import LandingNav from '@/components/landing/landing-nav';
import LandingFooter from '@/components/landing/landing-footer';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { Target, Search, Code2, Rocket, Play, Image, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface Props {
    auth: { user: { id: number; name: string } | null };
}

const steps = [
    {
        icon: Target,
        number: 1,
        title: 'Definí el propósito',
        subtitle: '¿Monetizar, networking o aprender?',
        content:
            'Antes de escribir una línea de código, definí PARA QUÉ querés construir este proyecto. ¿Buscás ganar dinero, hacer nuevos contactos en The Dev House, o mejorar tus skills como dev? Dependiendo del objetivo, los pasos a seguir van a ser distintos. Tenerlo claro desde el principio evita frustraciones.',
    },
    {
        icon: Search,
        number: 2,
        title: 'Poné tu idea bajo la lupa',
        subtitle: 'Validación antes de ejecución',
        content:
            '¿Es realmente necesaria tu idea? ¿Ya existe algo que resuelva exactamente lo mismo? Tal vez vale la pena construir algo parecido pero con nuevas features o mejoras. Desde mi punto de vista, la idea te tiene que MOVER. Si no te apasiona, construir esa app se va a sentir como un agobio en lugar de un camino de aprendizaje.',
    },
    {
        icon: Code2,
        number: 3,
        title: 'Plan de desarrollo y equipo',
        subtitle: 'De la idea al MVP',
        content:
            'Armá el plan de desarrollo, dividí en etapas, definí tecnologías y reuní a las personas interesadas en el proyecto. En The Dev House podés publicar tu idea y encontrar colaboradores que compartan tu visión. No hace falta que lo hagas solo.',
    },
    {
        icon: Rocket,
        number: 4,
        title: 'Desplegá y mejorá',
        subtitle: 'Testeá, lanzá, recibí feedback, iterá',
        content:
            'Luego de testear y tener una landing presentando el producto, llevalo a servidores de Discord, LinkedIn y comunidades donde los desarrolladores comparten sus proyectos. Recibí feedback y mejoralo. No te quedes en una primera versión: tratá de que el software quede lo más profesional posible para que ese posible usuario le dé uso real.',
    },
];

const resources = [
    { icon: Play, label: 'Videos guía', description: 'Tutoriales paso a paso del proceso' },
    { icon: Image, label: 'Galería de inspiración', description: 'Ejemplos visuales de proyectos' },
    { icon: BarChart3, label: 'Gráficos de proceso', description: 'Roadmaps y etapas del desarrollo' },
];

export default function HowStart({ auth }: Props) {
    const [heroRef, heroInView] = useInView({ threshold: 0.2 });
    const [stepsRef, stepsInView] = useInView({ threshold: 0.1 });

    return (
        <>
            <Seo title="Cómo empezar" description="Guía paso a paso para crear tu primer SaaS o proyecto colaborativo. Definí el propósito, validá tu idea, armá el plan y desplegá con The Dev House." />
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
                                'text-center max-w-3xl mx-auto transition-all duration-700',
                                heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            )}
                        >
                            {/* Author */}
                            <div className="inline-flex items-center gap-5 mb-10 px-5 py-3 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-accent/20 blur-md" />
                                    <img
                                        src="https://avatars.githubusercontent.com/u/52495199?v=4"
                                        alt="Matias Sanchez"
                                        className="relative size-14 rounded-full ring-2 ring-accent/30"
                                    />
                                </div>
                                <div className="text-left">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                                        Publicado por
                                    </span>
                                    <a
                                        href="https://the-dev-house.up.railway.app/users/matias-sanchez"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block font-display font-semibold text-foreground hover:text-accent-foreground transition-colors leading-tight"
                                    >
                                        Matias Sanchez
                                    </a>
                                    <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">
                                        Founder de The Dev House
                                    </p>
                                </div>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                Cómo empezar tu primer{' '}
                                <span className="text-accent-foreground bg-accent px-2">SaaS</span>{' '}
                                o proyecto colaborativo
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Una idea increíble no alcanza sin las herramientas, la estructura y un camino detallado.
                                Acá tenés una guía paso a paso.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Guía de 4 pasos */}
                <section ref={stepsRef} className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                El camino en 4 pasos
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                                De la idea al despliegue, sin perderse en el camino.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.number}
                                        className={cn(
                                            'relative flex flex-col md:flex-row gap-6 md:gap-10 mb-12 last:mb-0 transition-all duration-700',
                                            stepsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                        )}
                                        style={{ transitionDelay: `${index * 200}ms` }}
                                    >
                                        {/* Timeline connector */}
                                        {index < steps.length - 1 && (
                                            <div className="hidden md:block absolute left-8 top-16 bottom-0 w-0.5 bg-border" />
                                        )}

                                        {/* Step badge */}
                                        <div className="flex-shrink-0 relative z-10">
                                            <div className="size-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-xl shadow-lg">
                                                {step.number}
                                            </div>
                                        </div>

                                        {/* Content card */}
                                        <div className="flex-1 bg-background rounded-lg border border-border p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className="size-5 text-primary" />
                                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    {step.subtitle}
                                                </span>
                                            </div>
                                            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {step.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recursos visuales */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Recursos para el camino
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Próximamente: videos, imágenes y gráficos que ilustran cada etapa del proceso de creación de software.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {resources.map((resource) => {
                                const Icon = resource.icon;
                                return (
                                    <div
                                        key={resource.label}
                                        className="bg-muted/30 border border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="inline-flex items-center justify-center size-14 rounded-xl bg-accent/10 mb-5">
                                            <Icon className="size-7 text-accent-foreground/70" />
                                        </div>
                                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                                            {resource.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {resource.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Cierre */}
                <section className="py-20 bg-accent/5 border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            ¿Listo para empezar?
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
                            No te quedes con la idea. Encontrá con quién construirla.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href={route('projects.index')}>
                                <Button variant="secondary" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Explorar proyectos
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button variant="outline" size="lg">
                                    Crear cuenta gratis
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
