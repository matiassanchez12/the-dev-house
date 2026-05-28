import { Head, Link } from '@inertiajs/react';
import { Rocket, Users, MessageSquare, Zap, GitBranch, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/projects/project-card';
import ThemeToggle from '@/components/theme-toggle';
import { Project as ProjectType, LandingPageProps } from '@/types';
import LandingNav from '@/components/landing/landing-nav';
import LandingHero from '@/components/landing/landing-hero';
import LandingStats from '@/components/landing/landing-stats';
import LandingHowItWorks from '@/components/landing/landing-how-it-works';
import LandingSocial from '@/components/landing/landing-social';
import LandingManifesto from '@/components/landing/landing-manifesto';
import ApplicationLogo from '@/components/application-logo';

interface Props extends LandingPageProps {
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

const featureItems = [
    {
        icon: Rocket,
        title: 'Crea tu Proyecto',
        description: 'Comparte tu idea y encuentra desarrolladores talentosos para hacerla realidad',
    },
    {
        icon: Users,
        title: 'Únete a Equipos',
        description: 'Explora proyectos y únete a aquellos que se alinean con tus habilidades e intereses',
    },
    {
        icon: MessageSquare,
        title: 'Comunicación Fluida',
        description: 'Chat integrado y sistema de solicitudes para coordinar con tu equipo',
    },
];

export default function Landing({ auth, projects, user_count, project_count, collaboration_count }: Props) {
    return (
        <>
            <Head title="The Dev House — Donde los desarrolladores construyen juntos" />
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <LandingNav auth={auth} />

                {/* Hero */}
                <LandingHero auth={auth} />

                {/* Stats */}
                <LandingStats
                    user_count={user_count}
                    project_count={project_count}
                    collaboration_count={collaboration_count}
                />

                {/* Manifesto */}
                <LandingManifesto />

                {/* How It Works */}
                <LandingHowItWorks />

                {/* Social Proof */}
                {/* <LandingSocial developerCount={user_count} /> */}

                {/* Featured Projects Section */}
                <section id="projects" className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Proyectos Destacados</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Explora los últimos proyectos y encuentra el tuyo
                        </p>
                    </div>

                    {projects.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-4">
                                Aún no hay proyectos. ¡Sé el primero en crear uno!
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
                            <Button variant="outline" size="lg" className="text-lg px-8">
                                Ver todos los proyectos
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-accent/30 py-20">
                    <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">¿Por qué unirte?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Todo lo que necesitas para colaborar en proyectos de desarrollo
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

                            <div className="grid col-span-1 md:col-span-3 flex items-center justify-center w-full">
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

                {/* Footer */}
                <footer className="bg-muted py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center gap-6">
                            {/* Brand */}
                            <Link href="/" className="flex items-center gap-3">
                                <ApplicationLogo variant="icon" className="h-12" />
                                <div>
                                    <span className="font-display font-bold text-lg text-foreground">The Dev House</span>
                                    <p className="text-xs text-muted-foreground">Donde los desarrolladores construyen juntos</p>
                                </div>
                            </Link>

                            {/* Links */}
                            <div className="flex flex-wrap justify-center gap-6 text-sm">
                                <Link href={route('projects.index')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Proyectos
                                </Link>
                                <Link href={route('register')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Registrarme
                                </Link>
                                <Link href={route('login')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Iniciar sesión
                                </Link>
                            </div>

                            {/* Copyright & Attribution */}
                            <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground space-y-2">
                                <p>
                                    Developed with {'<3'} and
                                    <a
                                        href="https://opencode.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline mx-1"
                                    >
                                        OpenCode
                                    </a>
                                </p>
                                <p>
                                    <a
                                        href="https://github.com/matiassanchez12/the-dev-house"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        Contribuir en GitHub
                                    </a>
                                </p>
                                <p>&copy; {new Date().getFullYear()} The Dev House. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
