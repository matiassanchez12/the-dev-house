import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/Components/theme-toggle';
import { Project as ProjectType, Tech } from '@/types';

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
            <div className="min-h-screen bg-gradient-to-b from-background to-card">
                {/* Header con ThemeToggle */}
                <header className="container mx-auto px-4 py-4 flex justify-end">
                    <ThemeToggle />
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Conectá Desarrolladores,<br />Creá Proyectos Increíbles
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        La plataforma donde desarrolladores de todo el mundo se unen para colaborar en proyectos open source y comerciales.
                    </p>
                    <div className="flex gap-4 justify-center">
                        {auth.user ? (
                            <Link href={route('projects.create')}>
                                <Button size="lg" className="text-lg px-8">
                                    🚀 Crear Proyecto
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
                </section>

                {/* Stats Section */}
                <section className="bg-primary text-primary-foreground py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold mb-2">{projects.total}+</div>
                                <div className="text-primary-foreground/80">Proyectos Activos</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">100+</div>
                                <div className="text-primary-foreground/80">Desarrolladores</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">50+</div>
                                <div className="text-primary-foreground/80">Colaboraciones</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Projects Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Proyectos Destacados</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Explorá los últimos proyectos y encontrá el tuyo
                        </p>
                    </div>

                    {projects.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">
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
                                <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            <Link
                                                href={route('projects.show', project.slug)}
                                                className="hover:text-blue-600 transition"
                                            >
                                                {project.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {project.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        {/* Techs */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {project.techs?.slice(0, 5).map((tech) => (
                                                <Badge key={tech.id} variant="secondary">
                                                    {tech.name}
                                                </Badge>
                                            ))}
                                            {project.techs && project.techs.length > 5 && (
                                                <Badge variant="outline">
                                                    +{project.techs.length - 5}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Creator */}
                                        <div className="text-sm text-gray-500">
                                            Por: {project.creator?.name}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Badge
                                            variant={
                                                project.status === 'open'
                                                    ? 'default'
                                                    : project.status === 'completed'
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                        >
                                            {project.status === 'open'
                                                ? '🟢 Abierto'
                                                : project.status === 'completed'
                                                ? '✅ Completado'
                                                : '🔴 Cerrado'}
                                        </Badge>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link href={route('projects.index')}>
                            <Button variant="outline" size="lg">
                                Ver todos los proyectos →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-gray-100 dark:bg-gray-800 py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">¿Por qué unirte?</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Todo lo que necesitás para colaborar en proyectos de desarrollo
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-semibold mb-2">Creá tu Proyecto</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Compartí tu idea y encontrá desarrolladores talentosos para hacerla realidad
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">🤝</div>
                                <h3 className="text-xl font-semibold mb-2">Unite a Equipos</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Explorá proyectos y sumate a los que se alineen con tus intereses y habilidades
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold mb-2">Comunicación Fluida</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Chat integrado y sistema de solicitudes para coordinar con tu equipo
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                        Unite a nuestra comunidad de desarrolladores y llevá tus proyectos al siguiente nivel
                    </p>
                    {auth.user ? (
                        <Link href={route('projects.index')}>
                            <Button size="lg" className="text-lg px-8">
                                Explorar Proyectos
                            </Button>
                        </Link>
                    ) : (
                        <Link href={route('register')}>
                            <Button size="lg" className="text-lg px-8">
                                Crear Cuenta Gratis
                            </Button>
                        </Link>
                    )}
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>&copy; 2026 Dev Collab Platform. Todos los derechos reservados.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
