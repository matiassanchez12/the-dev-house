import ApplicationLogo from '@/components/application-logo';
import MobileNavMenu from '@/components/mobile-nav-menu';
import ThemeToggle from '@/components/theme-toggle';
import NotificationBell from '@/components/notification-bell';
import { Dropdown } from '@/components/ui/dropdown';
import NavLink from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bell, FolderKanban, Inbox, LogIn, LogOut, Settings2, Sparkles, UserRound, UsersRound } from 'lucide-react';
import { User } from '@/types';

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function AppLayout({ children, header }: Props) {
    const user = usePage<{ auth?: { user: User | null } }>().props.auth?.user ?? null;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const unreadNotifications = user?.unread_notifications_count ?? 0;

    const navLinks = [
        {
            href: route('projects.index'),
            label: 'Proyectos',
            description: 'Explorá proyectos activos',
            icon: FolderKanban,
            active: route().current('projects.*'),
        },
        {
            href: route('users.index'),
            label: 'Developers',
            description: 'Encontrá perfiles y skills',
            icon: UsersRound,
            active: route().current('users.*'),
        },
        {
            href: route('milestones.index'),
            label: 'Logros',
            description: 'Revisá hitos recientes',
            icon: Sparkles,
            active: route().current('milestones.*'),
        },
    ];

    const authenticatedNavLinks = user
        ? [
              {
                  href: route('join-requests.index'),
                  label: 'Solicitudes',
                  description: 'Gestioná tus invitaciones',
                  icon: Inbox,
                  active: route().current('join-requests.*'),
              },
          ]
        : [];

    const accountLinks = user
        ? [
              {
                  href: route('users.show', user.slug),
                  label: 'Mi Perfil',
                  description: 'Viendo tu espacio público',
                  icon: UserRound,
              },
              {
                  href: route('profile.edit'),
                  label: 'Configuración',
                  description: 'Ajustes de cuenta y perfil',
                  icon: Settings2,
              },
          ]
        : [
              {
                  href: route('login'),
                  label: 'Iniciar Sesión',
                  description: 'Entrá a tu cuenta',
                  icon: LogIn,
              },
              {
                  href: route('register'),
                  label: 'Registrarse',
                  description: 'Creá tu cuenta gratis',
                  icon: UserRound,
              },
          ];

    const logoHref = user ? route('dashboard') : '/';

    return (
        <div className="flex min-h-screen flex-col bg-background">
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
                            <NotificationBell />

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
                    <div className="mb-4 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            {user ? (
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-11">
                                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                            <AvatarFallback>
                                                {user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">@{user.slug}</p>
                                        </div>

                                        {unreadNotifications > 0 && (
                                            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-semibold text-foreground">The Dev House</p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Construí, conectá y mové tu proyecto desde acá.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-none pb-4">
                        <MobileNavMenu.Section title="Explorar" description="Navegá por los principales espacios de la app">
                            {[...navLinks, ...authenticatedNavLinks].map((link) => (
                                <MobileNavMenu.Link
                                    key={link.href}
                                    href={link.href}
                                    icon={link.icon}
                                    description={link.description}
                                    className={link.active ? 'bg-primary/5 text-foreground ring-1 ring-primary/10' : undefined}
                                >
                                    {link.label}
                                </MobileNavMenu.Link>
                            ))}
                        </MobileNavMenu.Section>

                        <MobileNavMenu.Section title="Preferencias" description="Ajustes rápidos sin salir del menú">
                            <ThemeToggle appearance="menu" />

                            {user && (
                                <MobileNavMenu.Link
                                    href={route('notifications.index')}
                                    icon={Bell}
                                    description="Revisá lo nuevo y marcá todo como leído"
                                    badge={unreadNotifications > 0 ? unreadNotifications : undefined}
                                >
                                    Notificaciones
                                </MobileNavMenu.Link>
                            )}
                        </MobileNavMenu.Section>

                        <MobileNavMenu.Section title="Cuenta" description="Acceso a tu perfil y sesión">
                            {accountLinks.map((link) => (
                                <MobileNavMenu.Link
                                    key={link.href}
                                    href={link.href}
                                    icon={link.icon}
                                    description={link.description}
                                >
                                    {link.label}
                                </MobileNavMenu.Link>
                            ))}

                            {user ? (
                                <MobileNavMenu.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    icon={LogOut}
                                    variant="destructive"
                                    description="Cerrá la sesión en este dispositivo"
                                >
                                    Cerrar Sesión
                                </MobileNavMenu.Link>
                            ) : null}
                        </MobileNavMenu.Section>
                    </div>
                </MobileNavMenu>
            </nav>

            {header && (
                <header className="bg-card shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="min-h-0 flex-1">{children}</main>
        </div>
    );
}
