import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Code2, Users, GitBranch, Sparkles } from 'lucide-react';

interface LandingHeroProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    className?: string;
}

const floatingTechs = [
    { icon: Code2, label: 'React', delay: '0s' },
    { icon: GitBranch, label: 'Laravel', delay: '1s' },
    { icon: Users, label: 'TypeScript', delay: '2s' },
    { icon: Sparkles, label: 'Python', delay: '0.5s' },
    { icon: Code2, label: 'Vue', delay: '1.5s' },
    { icon: GitBranch, label: 'Node.js', delay: '2.5s' },
];

export default function LandingHero({ auth, className }: LandingHeroProps) {
    return (
        <section className={`relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 ${className ?? ''}`}>
            {/* Dot pattern background */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]"
                style={{
                    backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Floating orbs */}
            <div className="absolute top-20 left-10 size-64 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-10 size-48 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    {/* Badge */}
                    <div
                        className="animate-fade-in-up mb-6"
                        style={{ '--stagger-delay': '0ms' } as React.CSSProperties}
                    >
                        <Badge variant="secondary" className="gap-1.5 text-sm">
                            <Sparkles className="size-3.5" />
                            Donde los desarrolladores construyen juntos
                        </Badge>
                    </div>

                    {/* Headline */}
                    <h1
                        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight animate-fade-in-up"
                        style={{ '--stagger-delay': '100ms' } as React.CSSProperties}
                    >
                        Construí junto a otros,<br />
                        <span className="text-primary">crecé como desarrollador</span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up"
                        style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
                    >
                        The Dev House es donde los desarrolladores descubren proyectos, encuentran colaboradores
                        y escriben código que importa. No más codificando solos en la oscuridad.
                    </p>

                    {/* CTA buttons */}
                    <div
                        className="flex gap-4 justify-center animate-fade-in-up"
                        style={{ '--stagger-delay': '300ms' } as React.CSSProperties}
                    >
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
                                        Comienza a Construir — Es Gratis
                                    </Button>
                                </Link>
                                <Link href={route('login')}>
                                    <Button variant="outline" size="lg" className="text-lg px-8">
                                        Iniciar sesión
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Floating tech badges */}
                    <div
                        className="flex flex-wrap gap-3 justify-center mt-16 animate-fade-in-up"
                        style={{ '--stagger-delay': '400ms' } as React.CSSProperties}
                    >
                        {floatingTechs.map((tech) => (
                            <Badge
                                key={tech.label}
                                variant="outline"
                                className="text-sm px-4 py-1.5 gap-2 animate-bob"
                                style={{ animationDelay: tech.delay } as React.CSSProperties}
                            >
                                <tech.icon className="size-3.5 text-muted-foreground" />
                                {tech.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
