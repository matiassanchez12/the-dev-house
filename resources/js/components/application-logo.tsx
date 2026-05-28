import { cn } from '@/lib/utils';

interface ApplicationLogoProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'full' | 'icon';
}

export default function ApplicationLogo({
    variant = 'icon',
    className,
    ...props
}: ApplicationLogoProps) {
    return (
        <div
            className={cn('flex items-center gap-2', className)}
            {...props}
        >
            {/* Icono SVG — house + code brackets */}
            <svg
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto fill-current text-foreground shrink-0"
            >
                {/* House shape */}
                <path d="M5 24 L20 9 L35 24 V38 H5 Z" />
                {/* Code brackets inside house */}
                <path d="M14 26 L10 32 L14 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26 26 L30 32 L26 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 24 L16 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Texto — solo en variant full */}
            {variant === 'full' && (
                <div className="flex flex-col text-center leading-tight">
                    <span className="font-display text-lg font-bold text-foreground">
                        The Dev House
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Donde los desarrolladores construyen juntos
                    </span>
                </div>
            )}
        </div>
    );
}