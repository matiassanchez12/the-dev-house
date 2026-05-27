import { cn } from '@/lib/utils';
import { Heart, Code2, Globe } from 'lucide-react';

interface LandingManifestoProps {
    className?: string;
}

export default function LandingManifesto({ className }: LandingManifestoProps) {
    return (
        <section className={cn('py-20 bg-accent/5 relative overflow-hidden', className)}>
            {/* Accent background treatment */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Manifesto icon */}
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-accent/10 mb-8">
                        <Heart className="size-8 text-accent" />
                    </div>

                    {/* Statement */}
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-foreground leading-tight">
                        We believe the best code is written together.
                    </h2>

                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Every great product started with someone brave enough to share an idea.
                            The Dev House exists to make that moment easier — connecting developers
                            who have something to build with developers who have something to contribute.
                        </p>
                        <p>
                            We&apos;re not just another job board or social network. We&apos;re a place
                            where real collaboration happens. Where junior devs learn from seniors,
                            where side projects become startups, and where the code you write together
                            is better than anything you could build alone.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="flex flex-wrap justify-center gap-6 mt-12">
                        {[
                            { icon: Code2, label: 'Open Source First' },
                            { icon: Heart, label: 'Community Driven' },
                            { icon: Globe, label: 'Built by Developers' },
                        ].map((value) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={value.label}
                                    className="flex items-center gap-2 text-sm font-medium text-foreground/70"
                                >
                                    <Icon className="size-4 text-accent" />
                                    {value.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
