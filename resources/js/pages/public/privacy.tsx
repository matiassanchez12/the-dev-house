import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import LandingNav from '@/components/landing/landing-nav';
import LandingFooter from '@/components/landing/landing-footer';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { Shield, Trash2 } from 'lucide-react';

interface Props {
    auth: { user: { id: number; name: string } | null };
}

const sections = [
    {
        title: '1. Datos que recopilamos',
        content:
            'Recopilamos únicamente los datos necesarios para operar la plataforma:',
        items: [
            'Datos de cuenta: nombre, email y contraseña (encriptada).',
            'Datos de perfil: biografía, tecnologías, redes sociales (si los proporcionás).',
            'Contenido publicado: proyectos, descripciones, imágenes, mensajes en chats y comentarios.',
            'Datos de uso: páginas visitadas, interacciones básicas para mejorar la experiencia.',
        ],
    },
    {
        title: '2. Para qué usamos tus datos',
        content:
            'Usamos tus datos exclusivamente para:',
        items: [
            'Operar y mantener la plataforma funcionando.',
            'Conectar desarrolladores con proyectos y equipos.',
            'Mejorar la experiencia de usuario y detectar problemas técnicos.',
            'Enviar comunicaciones esenciales (cambios en términos, novedades importantes).',
        ],
    },
    {
        title: '3. Compartición de datos',
        content:
            'No vendemos ni alquilamos tus datos personales a terceros. La información de tu perfil y proyectos es visible para otros usuarios de la plataforma según la configuración de privacidad que elijas. Solo compartimos datos con servicios externos cuando sea estrictamente necesario para el funcionamiento (hosting, base de datos, envío de emails) y bajo acuerdos de confidencialidad.',
    },
    {
        title: '4. Eliminación de cuenta y contenido',
        content:
            'Tenés control total sobre tu información. En cualquier momento podés:',
        items: [
            'Editar o eliminar el contenido que publicaste (proyectos, mensajes, perfil).',
            'Solicitar la eliminación definitiva de tu cuenta desde la configuración de perfil.',
            'Al eliminar tu cuenta, toda la información asociada se borra de forma permanente, incluyendo proyectos, solicitudes y datos personales.',
        ],
        highlight:
            'Cuando eliminás tu cuenta, toda la información que publicaste se elimina definitivamente. Solo conservamos registros mínimos si existen obligaciones legales vigentes.',
    },
    {
        title: '5. Seguridad',
        content:
            'Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o alteración. Tus contraseñas se almacenan encriptadas y las conexiones son seguras.',
    },
    {
        title: '6. Cambios en esta política',
        content:
            'Podemos actualizar esta política de privacidad. Los cambios importantes serán notificados a través de la plataforma o por email. Te recomendamos revisarla periódicamente.',
    },
    {
        title: '7. Contacto',
        content:
            'Si tenés preguntas sobre cómo manejamos tus datos o querés ejercer tu derecho de eliminación, escribinos:',
        contact: true,
    },
];

export default function Privacy({ auth }: Props) {
    const [ref, inView] = useInView({ threshold: 0.05 });

    return (
        <>
            <Seo title="Privacidad" description="Política de privacidad de The Dev House. Conocé cómo manejamos tus datos personales, tu derecho a eliminarlos y nuestras medidas de seguridad." />
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
                                <Shield className="size-6 text-primary" />
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Privacidad
                                </span>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                                Política de privacidad
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
                                        <p className="text-muted-foreground leading-relaxed mb-3">
                                            {section.content}
                                        </p>
                                        {section.items && (
                                            <ul className="space-y-2">
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
                                        {section.highlight && (
                                            <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-4 flex items-start gap-3">
                                                <Trash2 className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                                                    {section.highlight}
                                                </p>
                                            </div>
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
