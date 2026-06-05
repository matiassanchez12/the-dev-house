import { Link } from '@inertiajs/react';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileNavMenuContextValue {
    onClose: () => void;
}

const MobileNavMenuContext = createContext<MobileNavMenuContextValue | null>(null);

function useMobileNavMenu(): MobileNavMenuContextValue {
    const ctx = useContext(MobileNavMenuContext);

    if (!ctx) {
        throw new Error('MobileNavMenu.* must be used inside <MobileNavMenu>');
    }

    return ctx;
}

interface MobileNavMenuProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

function MobileNavMenu({ open, onClose, children, className }: MobileNavMenuProps) {
    return (
        <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    'data-[side=right]:w-screen data-[side=right]:max-w-none w-full gap-0 border-l border-border/70 bg-background/95 p-0 text-foreground backdrop-blur-xl sm:hidden',
                    className,
                )}
            >
                <SheetTitle className="sr-only">Menú principal</SheetTitle>

                <MobileNavMenuContext.Provider value={{ onClose }}>
                    <div className="relative flex h-full flex-col overflow-hidden">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/12 via-primary/5 to-transparent" />
                        <div className="relative flex h-full flex-col px-4 pb-5 pt-12">
                            {children}
                        </div>
                    </div>
                </MobileNavMenuContext.Provider>
            </SheetContent>
        </Sheet>
    );
}

interface MobileNavMenuSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

function MobileNavMenuSection({ title, description, children, className }: MobileNavMenuSectionProps) {
    return (
        <section
            className={cn(
                'rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm backdrop-blur-sm',
                className,
            )}
        >
            <div className="px-3 pb-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground/80">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-1">{children}</div>
        </section>
    );
}

type MobileNavLinkVariant = 'default' | 'destructive';

interface MobileNavLinkProps extends ComponentProps<typeof Link> {
    variant?: MobileNavLinkVariant;
    icon?: LucideIcon;
    description?: ReactNode;
    badge?: ReactNode;
}

function MobileNavLink({
    variant = 'default',
    icon: Icon,
    description,
    badge,
    className,
    onClick,
    children,
    ...props
}: MobileNavLinkProps) {
    const { onClose } = useMobileNavMenu();

    return (
        <Link
            {...props}
            onClick={(event) => {
                onClick?.(event);
                onClose();
            }}
            className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50',
                'hover:bg-muted/70 focus-visible:bg-muted/70',
                variant === 'destructive'
                    ? 'text-destructive hover:bg-destructive/8 focus-visible:bg-destructive/8'
                    : 'text-foreground',
                className,
                '[&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
            )}
        >
            {Icon ? (
                <span
                    className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors',
                        variant === 'destructive' && 'bg-destructive/10 text-destructive ring-destructive/10',
                    )}
                >
                    <Icon aria-hidden="true" />
                </span>
            ) : null}

            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-5">{children}</span>
                {description ? (
                    <span className="mt-0.5 block truncate text-xs leading-5 text-muted-foreground/80">
                        {description}
                    </span>
                ) : null}
            </span>

            {badge ? (
                <Badge variant={variant === 'destructive' ? 'destructive' : 'secondary'} className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    {badge}
                </Badge>
            ) : (
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            )}
        </Link>
    );
}

MobileNavMenu.Link = MobileNavLink;
MobileNavMenu.Section = MobileNavMenuSection;

export default MobileNavMenu;
