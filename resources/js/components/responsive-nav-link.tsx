import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: {
    active?: boolean;
    className?: string;
    children: React.ReactNode;
} & React.ComponentProps<typeof Link>) {
    return (
        <Link
            {...props}
            className={cn(
                'flex w-full items-start border-l-4 py-2 pe-4 ps-3 text-base font-medium transition duration-150 ease-in-out focus:outline-none',
                active
                    ? 'border-primary bg-primary/10 text-foreground focus:border-primary focus:bg-primary/10 focus:text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus:border-border focus:bg-muted focus:text-foreground',
                className
            )}
        >
            {children}
        </Link>
    );
}
