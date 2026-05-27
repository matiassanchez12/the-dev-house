import ApplicationLogo from '@/components/application-logo';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function GuestLayout({ children }: Props) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
            {/* Dot pattern background */}
            <div
                className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15]"
                style={{
                    backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo + tagline */}
                <div className="mb-8 text-center">
                    <Link href="/">
                        <ApplicationLogo variant="full" className="h-16 w-auto fill-current text-foreground mx-auto" />
                    </Link>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Where developers build together
                    </p>
                </div>

                {/* Card */}
                <div className="w-full overflow-hidden bg-card shadow-md sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
