import ApplicationLogo from '@/components/application-logo';
import MobileNavMenu from '@/components/mobile-nav-menu';
import ThemeToggle from '@/components/theme-toggle';
import NotificationBell from '@/components/notification-bell';
import { Dropdown } from '@/components/ui/dropdown';
import NavLink from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { User } from '@/types';

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function AppLayout({ children, header }: Props) {
    const user = usePage().props.auth.user as User | null;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: route('projects.index'), label: 'Proyectos', active: route().current('projects.*') },
        { href: route('users.index'), label: 'Developers', active: route().current('users.*') },
    ];

    const authenticatedNavLinks = user
        ? [
              { href: route('join-requests.index'), label: 'Solicitudes', active: route().current('join-requests.*') },
          ]
        : [];

    const logoHref = user ? route('dashboard') : '/';

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={logoHref}>
                                    <ApplicationLogo variant="icon" className="h-9" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {[...navLinks, ...authenticatedNavLinks].map((link) => (
                                    <NavLink
                                        key={link.href}
                                        href={link.href}
                                        active={link.active}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <ThemeToggle />
                            {user && <NotificationBell />}

                            {user ? (
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-card px-3 py-2 text-sm font-medium leading-4 text-muted-foreground transition duration-150 ease-in-out hover:text-foreground focus:outline-none"
                                                >
                                                    {user.name}

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('users.show', user.slug)}>
                                                Mi Perfil
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                Configuración
                                            </Dropdown.Link>
                                            <Dropdown.Separator />
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Cerrar Sesión
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 ms-4">
                                    <Link href={route('login')}>
                                        <Button variant="ghost" size="sm">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button size="sm">
                                            Registrarse
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <ThemeToggle />
                            {user && <NotificationBell />}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition duration-150 ease-in-out hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile full-screen menu */}
                <MobileNavMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                    {[...navLinks, ...authenticatedNavLinks].map((link) => (
                        <MobileNavMenu.Link key={link.href} href={link.href}>
                            {link.label}
                        </MobileNavMenu.Link>
                    ))}

                    <MobileNavMenu.Divider />

                    {user ? (
                        <>
                            <MobileNavMenu.Link href={route('users.show', user.slug)}>
                                Mi Perfil
                            </MobileNavMenu.Link>
                            <MobileNavMenu.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                variant="destructive"
                            >
                                Cerrar Sesión
                            </MobileNavMenu.Link>
                        </>
                    ) : (
                        <>
                            <MobileNavMenu.Link href={route('login')}>
                                Iniciar Sesión
                            </MobileNavMenu.Link>
                            <MobileNavMenu.Link href={route('register')}>
                                Registrarse
                            </MobileNavMenu.Link>
                        </>
                    )}
                </MobileNavMenu>
            </nav>

            {header && (
                <header className="bg-card shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}