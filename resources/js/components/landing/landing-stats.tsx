import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { useCountUp } from '@/hooks/use-count-up';
import { Users, FolderGit2, Handshake } from 'lucide-react';

interface LandingStatsProps {
    user_count: number;
    project_count: number;
    collaboration_count: number;
    className?: string;
}

const stats = [
    {
        key: 'developers',
        icon: Users,
        label: 'Developers',
        getValue: (p: LandingStatsProps) => p.user_count,
    },
    {
        key: 'projects',
        icon: FolderGit2,
        label: 'Proyectos',
        getValue: (p: LandingStatsProps) => p.project_count,
    },
    {
        key: 'collaborations',
        icon: Handshake,
        label: 'Colaboraciones',
        getValue: (p: LandingStatsProps) => p.collaboration_count,
    },
];

export default function LandingStats({
    user_count,
    project_count,
    collaboration_count,
    className,
}: LandingStatsProps) {
    const [ref, isInView] = useInView({ threshold: 0.3 });

    const animatedUsers = useCountUp(user_count, { trigger: isInView, duration: 2000 });
    const animatedProjects = useCountUp(project_count, { trigger: isInView, duration: 2000 });
    const animatedCollabs = useCountUp(collaboration_count, { trigger: isInView, duration: 2000 });

    const values = [animatedUsers, animatedProjects, animatedCollabs];

    return (
        <section
            ref={ref}
            className={cn('relative overflow-hidden py-20 bg-primary-soft text-primary-foreground', className)}
        >
            <div className="absolute inset-0 bg-dots-primary opacity-60" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.key}
                                className={cn(
                                    'transition-all duration-700',
                                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                )}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary-foreground/15 mb-4">
                                    <Icon className="size-6" />
                                </div>
                                <div className="text-4xl md:text-5xl font-bold mb-2 font-display">
                                    {values[index].toLocaleString()}
                                </div>
                                <div className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
