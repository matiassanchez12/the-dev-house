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
        } | null;
    };
    className?: string;
}

const navLinks = [
    { label: 'Características', href: '#features' },
    { label: 'Proyectos', href: '/projects' },
    { label: 'Logros', href: route('milestones.index') },
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

    useEffect(() => {
        if (!mobileOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const close = () => setMobileOpen(false);
    const toggle = () => setMobileOpen((v) => !v);

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
            {mobileOpen ? (
                <div
                    className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={close}
                    aria-hidden="true"
                />
            ) : null}

            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <ApplicationLogo variant="icon" className="h-10 w-auto" />
                        <span className="font-display font-bold text-lg">The Dev House</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
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

                    <div className="hidden lg:flex items-center gap-3">
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
                                    <Button size="sm" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">Comenzar</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            className="p-2 rounded-md hover:bg-accent/10 transition-colors"
                            onClick={toggle}
                            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'md:hidden relative z-50 overflow-hidden transition-all duration-300 ease-out',
                    mobileOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0',
                )}
            >
                <div className="border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
                    <div className="container mx-auto px-4 py-4 flex flex-col">
                        <nav aria-label="Navegación móvil" className="flex flex-col">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={close}
                                    className="px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground rounded-md"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                            {auth.user ? (
                                <Link href={route('dashboard')} onClick={close}>
                                    <Button variant="cta" size="lg" className="w-full">
                                        Ir al Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} onClick={close}>
                                        <Button
                                            size="lg"
                                            variant="secondary"
                                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                        >
                                            Comenzar
                                        </Button>
                                    </Link>
                                    <Link href={route('login')} onClick={close}>
                                        <Button variant="ghost" size="lg" className="w-full">
                                            Iniciar sesión
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
