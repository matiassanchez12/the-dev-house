import type { Tech } from '@/types';
import type { HeroTechGridProps } from './types';
import { ReactIcon } from '@/components/ui/svgs/react-icon';
import { LaravelIcon } from '@/components/ui/svgs/laravel-icon';
import { TypeScriptIcon } from '@/components/ui/svgs/typescript-icon';
import { PythonIcon } from '@/components/ui/svgs/python-icon';
import { NodeJsIcon } from '@/components/ui/svgs/nodejs-icon';

const CURATED_TECHS = ['React', 'Laravel', 'TypeScript', 'Python', 'Node.js'] as const;

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    React: ReactIcon,
    Laravel: LaravelIcon,
    TypeScript: TypeScriptIcon,
    Python: PythonIcon,
    'Node.js': NodeJsIcon,
};

function CuratedTechCard({ name }: { name: string }) {
    const Icon = ICON_MAP[name];
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/50 p-3 text-center">
            {Icon ? <Icon className="size-6" /> : null}
            <span className="text-xs font-medium text-foreground">{name}</span>
        </div>
    );
}

function DbTechCard({ tech }: { tech: Tech }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/50 p-3 text-center"
            title={tech.name}
        >
            <span className="text-xs font-medium text-foreground">{tech.name}</span>
        </div>
    );
}

function OverflowCard({ count }: { count: number }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/30 p-3 text-center"
            aria-label={`Y ${count} tecnologías más`}
        >
            <span className="text-xs font-medium text-muted-foreground">+{count}</span>
        </div>
    );
}

export function HeroTechGrid({ techs, className }: HeroTechGridProps) {
    if (techs.length === 0) {
        return (
            <div
                className={`grid grid-cols-3 md:grid-cols-3 gap-2 max-w-sm mx-auto md:mx-0 ${className ?? ''}`}
            >
                {CURATED_TECHS.map((name) => (
                    <CuratedTechCard key={name} name={name} />
                ))}
            </div>
        );
    }

    const visible = techs.slice(0, 5);
    const overflow = techs.length - visible.length;

    return (
        <div
            className={`grid grid-cols-3 md:grid-cols-3 gap-2 max-w-sm mx-auto md:mx-0 ${className ?? ''}`}
        >
            {visible.map((tech) => (
                <DbTechCard key={tech.id} tech={tech} />
            ))}
            {overflow > 0 ? <OverflowCard count={overflow} /> : null}
        </div>
    );
}
