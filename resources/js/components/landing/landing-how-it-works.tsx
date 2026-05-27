import { cn } from '@/lib/utils';
import { Search, Users, Rocket } from 'lucide-react';

interface LandingHowItWorksProps {
    className?: string;
}

const steps = [
    {
        icon: Search,
        title: 'Discover',
        description: 'Browse projects that match your skills and interests. Find teams looking for developers like you.',
    },
    {
        icon: Users,
        title: 'Collaborate',
        description: 'Join a project, connect with your team through built-in chat, and start building together.',
    },
    {
        icon: Rocket,
        title: 'Ship',
        description: 'Ship real products, grow your portfolio, and build your reputation in the community.',
    },
];

export default function LandingHowItWorks({ className }: LandingHowItWorksProps) {
    return (
        <section className={cn('py-20 bg-background', className)}>
            <div className="container mx-auto px-4">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Three simple steps to go from solo developer to shipping with a team.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden lg:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-border" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.title}
                                    className="relative text-center"
                                >
                                    {/* Step number badge */}
                                    <div className="relative z-10 inline-flex items-center justify-center size-16 rounded-full bg-accent text-accent-foreground font-display font-bold text-xl mb-6 shadow-lg">
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/5 mb-4">
                                        <Icon className="size-6 text-primary" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
