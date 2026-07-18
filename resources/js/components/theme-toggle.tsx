import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    appearance?: 'icon' | 'menu';
    className?: string;
}

export default function ThemeToggle({ appearance = 'icon', className }: ThemeToggleProps) {
    // Read from localStorage synchronously to avoid flash
    const getInitialTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

    useEffect(() => {
        // Apply theme class to html element
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    if (appearance === 'menu') {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={toggleTheme}
                aria-pressed={theme === 'dark'}
                className={cn(
                    'h-auto w-full justify-between rounded-3xl border-border/70 bg-card/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card',
                    className,
                )}
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                        {theme === 'light' ? <MoonStar data-icon="inline-start" /> : <SunMedium data-icon="inline-start" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                        <span className="text-sm font-semibold text-foreground">Tema</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                        </span>
                    </span>
                </span>

                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {theme === 'light' ? 'Claro' : 'Oscuro'}
                </span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            className={className}
        >
            {theme === 'light' ? <MoonStar /> : <SunMedium />}
        </Button>
    );
}
