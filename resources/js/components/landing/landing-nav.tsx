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
    { label: 'Features', href: '#features' },
    { label: 'Projects', href: '#projects' },
    { label: 'Developers', href: '#developers' },
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
                                <Button variant="default" size="sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="sm">Get Started</Button>
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
                    <div className="md:hidden pb-4 border-t border-border/50 pt-4">
                        <div className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex gap-2 pt-2">
                                <ThemeToggle />
                                {auth.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button variant="default" size="sm" className="w-full">Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">Log in</Button>
                                        </Link>
                                        <Link href={route('register')} className="flex-1">
                                            <Button size="sm" className="w-full">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
