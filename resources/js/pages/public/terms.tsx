import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import LandingNav from '@/components/landing/landing-nav';
import LandingFooter from '@/components/landing/landing-footer';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { FileText } from 'lucide-react';

interface Props {
    auth: { user: { id: number; name: string; email: string } | null };
}

const sections = [
    {
        title: '1. Aceptación de los términos',
        content:
            'Al registrarte y utilizar The Dev House, aceptás los presentes términos de uso. Si no estás de acuerdo, no uses la plataforma.',
    },
    {
        title: '2. Uso aceptable',
        content:
            'Te comprometés a usar la plataforma de forma respetuosa y constructiva. No está permitido: publicar contenido ofensivo, acosar a otros usuarios, hacer spam, ni utilizar la plataforma para actividades ilegales.',
        items: [
            'Respetar a los demás miembros de la comunidad.',
            'No publicar proyectos o contenido que viole derechos de autor.',
            'No utilizar la plataforma para fines maliciosos o fraudulentos.',
        ],
    },
    {
        title: '3. Cuentas y responsabilidad',
        content:
            'Sos responsable de mantener la confidencialidad de tu cuenta y contraseña. La información que proporcionás debe ser veraz y actualizada. Cada usuario es responsable del contenido que publica.',
    },
    {
        title: '4. Propiedad intelectual del contenido',
        content:
            'El código, diseños y contenido que subís a la plataforma sigue siendo de tu propiedad. The Dev House no reclama derechos de autor sobre tu trabajo. Al publicar un proyecto, concedés a la plataforma una licencia limitada para mostrarlo y compartirlo dentro de la comunidad.',
    },
    {
        title: '5. Limitación de responsabilidad',
        content:
            'The Dev House se proporciona "tal cual", sin garantías de ningún tipo. No nos hacemos responsables por daños directos o indirectos derivados del uso de la plataforma, incluyendo la pérdida de datos o la confianza depositada en otros usuarios.',
    },
    {
        title: '6. Modificaciones',
        content:
            'Podemos actualizar estos términos en cualquier momento. Los cambios serán comunicados a través de la plataforma o por email. El uso continuado después de los cambios implica la aceptación de los nuevos términos.',
    },
    {
        title: '7. Contacto',
        content: 'Para consultas sobre estos términos, escribinos a:',
        contact: true,
    },
];

export default function Terms({ auth }: Props) {
    const [ref, inView] = useInView({ threshold: 0.05 });

    return (
        <>
            <Seo title="Términos de uso" description="Términos de uso de The Dev House. Reglas de la plataforma, responsabilidades de los usuarios y propiedad intelectual del contenido." />
            <div className="min-h-screen bg-background">
                <LandingNav auth={auth} />

                <section
                    ref={ref}
                    className="relative pt-32 pb-20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background pointer-events-none" />
                    <div className="container mx-auto px-4 relative">
                        <div
                            className={cn(
                                'max-w-3xl mx-auto transition-all duration-700',
                                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            )}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="size-6 text-primary" />
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Legal
                                </span>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                                Términos de uso
                            </h1>
                            <p className="text-muted-foreground mb-16 text-lg">
                                Última actualización: enero 2026
                            </p>

                            <div className="space-y-12">
                                {sections.map((section) => (
                                    <div key={section.title}>
                                        <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {section.content}
                                        </p>
                                        {section.items && (
                                            <ul className="mt-3 space-y-2">
                                                {section.items.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-start gap-2 text-muted-foreground"
                                                    >
                                                        <span className="flex-shrink-0 mt-2 size-1.5 rounded-full bg-accent" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {section.contact && (
                                            <Link
                                                href={route('contact')}
                                                className="text-accent-foreground underline underline-offset-4 hover:no-underline transition-colors"
                                            >
                                                Página de contacto
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
