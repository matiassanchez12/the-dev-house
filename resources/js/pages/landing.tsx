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
        title: 'Create Your Project',
        description: 'Share your idea and find talented developers to make it happen',
    },
    {
        icon: Users,
        title: 'Join Teams',
        description: 'Explore projects and join ones that align with your skills and interests',
    },
    {
        icon: MessageSquare,
        title: 'Seamless Communication',
        description: 'Built-in chat and request system to coordinate with your team',
    },
];

export default function Landing({ auth, projects, user_count, project_count, collaboration_count }: Props) {
    return (
        <>
            <Head title="The Dev House — Where developers build together" />
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

                {/* How It Works */}
                <LandingHowItWorks />

                {/* Social Proof */}
                <LandingSocial developerCount={user_count} />

                {/* Manifesto */}
                <LandingManifesto />

                {/* Featured Projects Section */}
                <section id="projects" className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Featured Projects</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Explore the latest projects and find yours
                        </p>
                    </div>

                    {projects.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-4">
                                No projects yet. Be the first to create one!
                            </p>
                            {auth.user ? (
                                <Link href={route('projects.create')}>
                                    <Button>Create my first project</Button>
                                </Link>
                            ) : (
                                <Link href={route('register')}>
                                    <Button>Sign up</Button>
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
                                View all projects
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-accent/30 py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">Why join?</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Everything you need to collaborate on development projects
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
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to start building?</h2>
                        <p className="text-accent-foreground/80 mb-8 max-w-xl mx-auto">
                            Join our community of developers and take your projects to the next level
                        </p>
                        {auth.user ? (
                            <Link href={route('projects.index')}>
                                <Button size="lg" className="text-lg px-8 bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                                    Explore Projects
                                    <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href={route('register')}>
                                <Button size="lg" className="text-lg px-8 bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                                    Create Free Account
                                    <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-muted py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center gap-6">
                            {/* Brand */}
                            <Link href="/" className="flex items-center gap-3">
                                <ApplicationLogo variant="icon" className="h-12 w-auto" />
                                <div>
                                    <span className="font-display font-bold text-lg text-foreground">The Dev House</span>
                                    <p className="text-xs text-muted-foreground">Where developers build together</p>
                                </div>
                            </Link>

                            {/* Links */}
                            <div className="flex flex-wrap justify-center gap-6 text-sm">
                                <Link href={route('projects.index')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Projects
                                </Link>
                                <Link href={route('register')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Sign Up
                                </Link>
                                <Link href={route('login')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Log In
                                </Link>
                            </div>

                            {/* Copyright */}
                            <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
                                <p>&copy; {new Date().getFullYear()} The Dev House. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
