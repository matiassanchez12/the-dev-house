import { Head, Link } from '@inertiajs/react';
import { Rocket, Users, MessageSquare, Zap, GitBranch, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/projects/project-card';
import ThemeToggle from '@/components/theme-toggle';
import { Project as ProjectType } from '@/types';

// Static JSX elements hoisted outside component (rendering-hoist-jsx)
const heroBadge = (
    <Badge variant="secondary" className="mb-4">
        <Star className="size-3 mr-1" />
        Nueva versión disponible
    </Badge>
);

const statItems = [
    { value: '500+', label: 'Proyectos Activos' },
    { value: '2,000+', label: 'Desarrolladores' },
    { value: '1,200+', label: 'Colaboraciones' },
];

const featureItems = [
    {
        icon: Rocket,
        title: 'Creá tu Proyecto',
        description: 'Compartí tu idea y encontrá desarrolladores talentosos para hacerla realidad',
    },
    {
        icon: Users,
        title: 'Unite a Equipos',
        description: 'Explorá proyectos y sumate a los que se alineen con tus intereses y habilidades',
    },
    {
        icon: MessageSquare,
        title: 'Comunicación Fluida',
        description: 'Chat integrado y sistema de solicitudes para coordinar con tu equipo',
    },
];

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    projects: {
        data: ProjectType[];
        total: number;
    };
}

export default function Landing({ auth, projects }: Props) {
    return (
        <>
            <Head title="Dev Collab Platform" />
            <div className="min-h-screen bg-background">
                {/* Header con ThemeToggle */}
                <header className="container mx-auto px-4 py-4 flex justify-end">
                    <ThemeToggle />
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-16 md:py-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="animate-fade-in-up" style={{ '--stagger-delay': '0ms' } as React.CSSProperties}>
                            {heroBadge}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground animate-fade-in-up" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                            Conectá Desarrolladores,<br />Creá Proyectos Increíbles
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
                            La plataforma donde desarrolladores de todo el mundo se unen para colaborar en proyectos open source y comerciales.
                        </p>
                        <div className="flex gap-4 justify-center animate-fade-in-up" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                            {auth.user ? (
                                <Link href={route('projects.create')}>
                                    <Button size="lg" className="text-lg px-8">
                                        <Rocket className="size-5 mr-2" />
                                        Crear Proyecto
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')}>
                                        <Button size="lg" className="text-lg px-8">
                                            Comenzar Gratis
                                        </Button>
                                    </Link>
                                    <Link href={route('login')}>
                                        <Button variant="outline" size="lg" className="text-lg px-8">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Floating tech badges */}
                    <div className="flex flex-wrap gap-2 justify-center mt-12 animate-fade-in-up" style={{ '--stagger-delay': '400ms' } as React.CSSProperties}>
                        {['React', 'Laravel', 'TypeScript', 'Vue', 'Python'].map((tech) => (
                            <Badge key={tech} variant="outline" className="text-sm px-3 py-1">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-primary text-primary-foreground py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {statItems.map((stat, index) => (
                                <div key={stat.label} className="animate-fade-in-up" style={{ '--stagger-delay': `${index * 100}ms` } as React.CSSProperties}>
                                    <div className="text-4xl md:text-5xl font-bold mb-2 font-display">{stat.value}</div>
                                    <div className="text-primary-foreground/80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Projects Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Proyectos Destacados</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Explorá los últimos proyectos y encontrá el tuyo
                        </p>
                    </div>

                    {projects.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-4">
                                No hay proyectos aún. ¡Sé el primero en crear uno!
                            </p>
                            {auth.user ? (
                                <Link href={route('projects.create')}>
                                    <Button>Crear mi primer proyecto</Button>
                                </Link>
                            ) : (
                                <Link href={route('register')}>
                                    <Button>Registrarme</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.data.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="featured"
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link href={route('projects.index')}>
                            <Button variant="outline" size="lg">
                                Ver todos los proyectos
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-accent/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">¿Por qué unirte?</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Todo lo que necesitás para colaborar en proyectos de desarrollo
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featureItems.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="text-center p-6 rounded-xl bg-background/50 hover:bg-background/80 transition-colors animate-fade-in-up"
                                    style={{ '--stagger-delay': `${index * 100}ms` } as React.CSSProperties}
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
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-accent text-accent-foreground py-20">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-accent-foreground/10 mb-6">
                            <Zap className="size-8" />
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
                        <p className="text-accent-foreground/80 mb-8 max-w-xl mx-auto">
                            Unite a nuestra comunidad de desarrolladores y llevá tus proyectos al siguiente nivel
                        </p>
                        {auth.user ? (
                            <Link href={route('projects.index')}>
                                <Button size="lg" className="text-lg px-8 bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                                    Explorar Proyectos
                                    <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href={route('register')}>
                                <Button size="lg" className="text-lg px-8 bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                                    Crear Cuenta Gratis
                                    <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-foreground text-background py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h3 className="font-display font-bold text-lg mb-4">DevCollab</h3>
                                <p className="text-sm text-muted-foreground">
                                    Conectando desarrolladores para crear proyectos increíbles.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Platforma</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href={route('projects.index')} className="hover:underline">Proyectos</Link></li>
                                    <li><Link href={route('register')} className="hover:underline">Unirse</Link></li>
                                    <li><Link href="#" className="hover:underline">Documentación</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Recursos</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="#" className="hover:underline">API</Link></li>
                                    <li><Link href="#" className="hover:underline">Tutoriales</Link></li>
                                    <li><Link href="#" className="hover:underline">Blog</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Comunidad</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="#" className="hover:underline">Discord</Link></li>
                                    <li><Link href="#" className="hover:underline">GitHub</Link></li>
                                    <li><Link href="#" className="hover:underline">Twitter</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-background/10 pt-8 text-center text-sm">
                            <p>&copy; 2026 DevCollab Platform. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}