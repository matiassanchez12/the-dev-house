import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import ApplicationLogo from '@/components/application-logo';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme-toggle';
import { Menu, X } from 'lucide-react';

interface LandingNavProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    className?: string;
}

const navLinks = [
    { label: 'Características', href: '#features' },
    { label: 'Proyectos', href: '/projects' },
    { label: 'Developers', href: '/users' },
    { label: 'Cómo empezar', href: '/how-start' },
];

export default function LandingNav({ auth, className }: LandingNavProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled
                    ? 'backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm'
                    : 'bg-transparent',
                className,
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo variant="icon" className="h-10 w-auto" />
                        <span className="font-display font-bold text-lg hidden sm:inline">The Dev House</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        {auth.user ? (
                            <Link href={route('dashboard')}>
                                <Button variant="secondary" size="sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="ghost" size="sm">Iniciar sesión</Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="sm" variant='secondary' className="bg-accent text-accent-foreground hover:bg-accent/90">Comenzar</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-md hover:bg-accent/10"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden -mx-4 border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
                        <div className="flex flex-col p-4">
                            <nav aria-label="Navegación móvil" className="flex flex-col">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>

                            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                                {auth.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button variant="cta" size="lg" className="w-full">
                                            Ir al Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('register')}>
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                            >
                                                Comenzar
                                            </Button>
                                        </Link>
                                        <Link href={route('login')}>
                                            <Button variant="ghost" size="lg" className="w-full">
                                                Iniciar sesión
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Apariencia
                                </span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
