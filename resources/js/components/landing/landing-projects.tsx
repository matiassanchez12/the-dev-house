import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Project as ProjectType } from "@/types";
import { ProjectCard } from "../projects/card";

interface Props {
    projects: { data: ProjectType[]; total: number };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
}

export default function LandingProjects({ projects, auth }: Props) {
    return <section id="projects" className="container mx-auto px-4 py-20">
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
    </section>;
};