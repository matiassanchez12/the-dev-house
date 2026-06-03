import { useState, type FormEvent } from 'react';
import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import LandingNav from '@/components/landing/landing-nav';
import LandingFooter from '@/components/landing/landing-footer';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    auth: { user: { id: number; name: string } | null };
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const reasons = [
    { value: 'consulta', label: 'Consulta general' },
    { value: 'colaboracion', label: 'Propuesta de colaboración' },
    { value: 'reporte', label: 'Reportar un problema' },
    { value: 'sugerencia', label: 'Sugerencia' },
    { value: 'otro', label: 'Otro' },
];

export default function Contact({ auth }: Props) {
    const [heroRef, heroInView] = useInView({ threshold: 0.2 });
    const [state, setState] = useState<FormState>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({ name: '', email: '', reason: '', message: '' });

    function validate(): boolean {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
        if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email inválido';
        if (!form.reason) newErrors.reason = 'Seleccioná un motivo';
        if (!form.message.trim()) newErrors.message = 'El mensaje es obligatorio';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setState('submitting');
        // TODO: conectar con endpoint backend de contacto
        setTimeout(() => {
            setState('success');
        }, 1000);
    }

    return (
        <>
            <Seo title="Contacto" description="Contactanos. Escribinos a hola@thedevhouse.app o completá el formulario para consultas, propuestas de colaboración o sugerencias." />
            <div className="min-h-screen bg-background">
                <LandingNav auth={auth} />

                {/* Hero */}
                <section
                    ref={heroRef}
                    className="relative pt-32 pb-16 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background pointer-events-none" />
                    <div className="container mx-auto px-4 relative">
                        <div
                            className={cn(
                                'max-w-3xl mx-auto text-center transition-all duration-700',
                                heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                            )}
                        >
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                Hablemos
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                                ¿Tenés una consulta, querés colaborar o simplemente saludar? Escribinos y te
                                respondemos a la brevedad.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Form + alternativa */}
                <section className="pb-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            {state === 'success' ? (
                                <div className="bg-background border border-border rounded-lg p-12 text-center">
                                    <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
                                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                                        Mensaje enviado
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Gracias por contactarte. Te vamos a responder pronto.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setState('idle');
                                            setForm({ name: '', email: '', reason: '', message: '' });
                                        }}
                                    >
                                        Enviar otro mensaje
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm">
                                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name" className="text-foreground">
                                                Nombre <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="Tu nombre"
                                                aria-invalid={!!errors.name}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="size-3" /> {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-foreground">
                                                Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="tu@email.com"
                                                aria-invalid={!!errors.email}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="size-3" /> {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Reason */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="reason" className="text-foreground">
                                                Motivo <span className="text-destructive">*</span>
                                            </Label>
                                            <select
                                                id="reason"
                                                value={form.reason}
                                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                                className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"
                                                aria-invalid={!!errors.reason}
                                            >
                                                <option value="" disabled>
                                                    Seleccioná un motivo
                                                </option>
                                                {reasons.map((r) => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.reason && (
                                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="size-3" /> {errors.reason}
                                                </p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="message" className="text-foreground">
                                                Mensaje <span className="text-destructive">*</span>
                                            </Label>
                                            <Textarea
                                                id="message"
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                placeholder="Escribí tu mensaje..."
                                                rows={5}
                                                aria-invalid={!!errors.message}
                                            />
                                            {errors.message && (
                                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="size-3" /> {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            size="lg"
                                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                            disabled={state === 'submitting'}
                                        >
                                            {state === 'submitting' ? (
                                                'Enviando...'
                                            ) : (
                                                <>
                                                    <Send className="size-4" />
                                                    Enviar mensaje
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* Contacto alternativo */}
                            <div className="mt-8 text-center">
                                <div className="inline-flex items-center gap-2 text-muted-foreground">
                                    <Mail className="size-4" />
                                    <span className="text-sm">
                                        También podés escribirnos a{' '}
                                        <a
                                            href="mailto:hola@thedevhouse.app"
                                            className="text-foreground underline underline-offset-4 hover:text-accent-foreground transition-colors"
                                        >
                                            hola@thedevhouse.app
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
