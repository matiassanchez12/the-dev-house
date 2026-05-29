import { Link } from "@inertiajs/react";
import ApplicationLogo from "../application-logo";

export default function LandingFooter() {
    return <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-6">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3">
                    <ApplicationLogo variant="icon" className="h-12" />
                    <div>
                        <span className="font-display font-bold text-lg text-foreground">The Dev House</span>
                        <p className="text-xs text-muted-foreground">Donde los desarrolladores construyen juntos</p>
                    </div>
                </Link>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <Link href={route('projects.index')} className="text-muted-foreground hover:text-foreground transition-colors">
                        Proyectos
                    </Link>
                    <Link href={route('register')} className="text-muted-foreground hover:text-foreground transition-colors">
                        Registrarme
                    </Link>
                    <Link href={route('login')} className="text-muted-foreground hover:text-foreground transition-colors">
                        Iniciar sesión
                    </Link>
                </div>

                {/* Copyright & Attribution */}
                <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground space-y-2">
                    <p>
                        <a
                            href="https://github.com/matiassanchez12/the-dev-house"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Contribuir en GitHub
                        </a>
                    </p>
                    <p>&copy; {new Date().getFullYear()} The Dev House. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>;
};