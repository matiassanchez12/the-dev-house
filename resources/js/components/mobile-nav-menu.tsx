import { Link } from '@inertiajs/react';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { X } from 'lucide-react';
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
    if (!open) return null;

    return (
        <MobileNavMenuContext.Provider value={{ onClose }}>
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm sm:hidden',
                    className,
                )}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                    className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center gap-6">{children}</div>
            </div>
        </MobileNavMenuContext.Provider>
    );
}

type MobileNavLinkVariant = 'default' | 'destructive';

type MobileNavLinkProps = ComponentProps<typeof Link> & {
    variant?: MobileNavLinkVariant;
};

function MobileNavLink({ variant = 'default', className, onClick, ...props }: MobileNavLinkProps) {
    const { onClose } = useMobileNavMenu();

    return (
        <Link
            {...props}
            onClick={(event) => {
                onClick?.(event);
                onClose();
            }}
            className={cn(
                'text-2xl font-medium',
                variant === 'destructive'
                    ? 'text-destructive hover:text-destructive/80'
                    : 'text-foreground hover:text-primary',
                className,
            )}
        />
    );
}

function MobileNavDivider() {
    return <div className="my-2 h-px w-32 bg-border" />;
}

MobileNavMenu.Link = MobileNavLink;
MobileNavMenu.Divider = MobileNavDivider;

export default MobileNavMenu;
