import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { Button } from "../ui/button";
import { Project as ProjectType } from "@/types";
import { ProjectCard } from "../projects/card";

interface Props {
    projects: { data: ProjectType[]; total: number };
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
}

export default function LandingProjects({ projects, auth }: Props) {
    const [ref, isInView] = useInView({ threshold: 0.1 });

    return (
        <section ref={ref} id="projects" className="relative overflow-hidden py-20">
            <div className="absolute inset-0 bg-dots" />
            <div className="absolute inset-0 bg-glow-tr" />

            <div className="container mx-auto px-4 relative z-10">
                <div className={cn(
                    'text-center mb-12 transition-all duration-700',
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )}>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Proyectos Destacados</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Explorá los últimos proyectos y encontrá el tuyo
                    </p>
                </div>

                {projects.data.length === 0 ? (
                    <div className={cn(
                        'text-center py-12 transition-all duration-700',
                        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                    )}>
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
                        {projects.data.map((project, index) => (
                            <div
                                key={project.id}
                                className={cn(
                                    'transition-all duration-700',
                                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                )}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <ProjectCard
                                    project={project}
                                    variant="featured"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className={cn(
                    'text-center mt-12 transition-all duration-700',
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )} style={{ transitionDelay: '400ms' }}>
                    <Link href={route('projects.index')}>
                        <Button variant="outline" size="lg" className="text-lg px-8">
                            Ver todos los proyectos
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}