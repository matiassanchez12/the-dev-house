import { cn } from '@/lib/utils';

interface ApplicationLogoProps extends React.SVGAttributes<SVGElement> {
    variant?: 'full' | 'icon';
}

export default function ApplicationLogo({
    variant = 'icon',
    className,
    ...props
}: ApplicationLogoProps) {
    return (
        <svg
            viewBox="0 0 200 60"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('fill-current text-foreground', className)}
            {...props}
        >
            {/* House shape */}
            <path d="M10 35 L30 15 L50 35 V55 H10 Z" />
            {/* Code brackets inside house */}
            <path d="M22 38 L18 44 L22 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M38 38 L42 44 L38 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 36 L27 52" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

            {variant === 'full' && (
                <>
                    {/* "The Dev House" text */}
                    <text
                        x="62"
                        y="28"
                        fontFamily="Bricolage Grotesque, sans-serif"
                        fontSize="18"
                        fontWeight="700"
                        fill="currentColor"
                    >
                        The Dev House
                    </text>
                    {/* Tagline */}
                    <text
                        x="62"
                        y="44"
                        fontFamily="Inter, sans-serif"
                        fontSize="9"
                        fontWeight="400"
                        fill="currentColor"
                        opacity="0.7"
                    >
                        Where developers build together
                    </text>
                </>
            )}
        </svg>
    );
}
