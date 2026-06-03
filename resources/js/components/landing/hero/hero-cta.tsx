import { Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeroCtaProps } from './types';

export function HeroCta({ auth, className }: HeroCtaProps) {
    const isAuthed = auth.user !== null;
    const primaryHref = isAuthed ? route('projects.create') : route('register');
    const primaryLabel = isAuthed ? 'Crear proyecto' : 'Empezá gratis';

    const baseClasses = 'min-h-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    return (
        <div className={cn('flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center', className)}>
            <Link
                href={primaryHref}
                className={cn(buttonVariants({ variant: 'cta', size: 'lg' }), baseClasses)}
            >
                {primaryLabel}
            </Link>
            <Link
                href={route('projects.index')}
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), baseClasses)}
            >
                Explorar proyectos
            </Link>
        </div>
    );
}
