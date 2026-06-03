import ApplicationLogo from '@/components/application-logo';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

function GuestBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 50% 50%, hsl(var(--muted-foreground)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    maskImage:
                        'radial-gradient(ellipse 80% 50% at 50% 50%, black 20%, transparent 70%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 80% 50% at 50% 50%, black 20%, transparent 70%)',
                }}
            />

            <div className="absolute top-1/4 -left-32 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-1/4 -right-24 size-64 rounded-full bg-primary/15 blur-3xl" />
        </div>
    );
}

export default function GuestLayout({ children }: Props) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
            <GuestBackground />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="mb-8 text-center">
                    <Link href="/">
                        <ApplicationLogo variant="full" className="h-16 mx-auto" />
                    </Link>
                </div>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
