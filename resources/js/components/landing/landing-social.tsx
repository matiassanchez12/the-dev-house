import { cn } from '@/lib/utils';
import { User } from '@/types';

interface LandingSocialProps {
    developerCount?: number;
    className?: string;
    developers: User[]
}

const bgAvatarColors = ['bg-primary/20', 'bg-accent/30', 'bg-primary/40', 'bg-accent/20', 'bg-primary/30'];

export default function LandingSocial({ developers, className }: LandingSocialProps) {
    return (
        <section className={cn('py-20 bg-muted/30', className)}>
            <div className="container mx-auto px-4">
                {/* Social proof header */}
                <div className="text-center mb-16">
                    {/* Avatar stack */}
                    <div className="flex justify-center mb-6">
                        <div className="flex -space-x-3">
                            {developers.map((developer, i) => (
                                <div
                                    key={i}
                                    className={`size-10 rounded-full ${bgAvatarColors[i]} border-2 border-background flex items-center justify-center text-xs font-bold text-foreground`}
                                >
                                    {developer.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        {developers.length.toLocaleString()}+ developers ya estan construyendo algo juntos!
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Construir junto a otros nunca fue tan facil, publicá tu proyecto hoy y conecta con otros devs que están en la misma que vos.
                    </p>
                </div>

                {/* Testimonial cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
                        >
                            <Quote className="size-5 text-accent mb-4" />
                            <p className="text-foreground/80 mb-6 leading-relaxed text-sm">
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-foreground">
                                    {testimonial.author[0]}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-foreground">{testimonial.author}</div>
                                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>
        </section>
    );
}
