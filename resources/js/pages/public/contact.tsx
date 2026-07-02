import { useForm } from '@inertiajs/react'
import Seo from '@/components/seo'
import LandingNav from '@/components/landing/landing-nav'
import LandingFooter from '@/components/landing/landing-footer'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Send } from 'lucide-react'

interface Props {
    auth: { user: { id: number; name: string } | null }
}

const satisfactionOptions = [
    { value: '1', label: '1 - Muy insatisfecho' },
    { value: '2', label: '2 - Insatisfecho' },
    { value: '3', label: '3 - Neutral' },
    { value: '4', label: '4 - Satisfecho' },
    { value: '5', label: '5 - Muy satisfecho' },
]

const understoodPurposeOptions = [
    { value: 'yes', label: 'Sí, totalmente' },
    { value: 'partly', label: 'Más o menos' },
    { value: 'no', label: 'No del todo' },
]

const joinProjectOptions = [
    { value: 'yes', label: 'Sí' },
    { value: 'maybe', label: 'Tal vez' },
    { value: 'no', label: 'No' },
]

const preferredProjectTypeOptions = [
    { value: 'practice', label: 'Proyectos de práctica' },
    { value: 'portfolio', label: 'Proyectos de portfolio' },
    { value: 'real', label: 'Proyectos reales' },
]

export default function Contact({ auth }: Props) {
    const [heroRef, heroInView] = useInView({ threshold: 0.2 })
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        name: '',
        email: '',
        satisfaction: '',
        understood_purpose: '',
        would_join_project: '',
        missing_feature: '',
        tech_stack: '',
        preferred_project_type: '',
        improvements: '',
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/contact')
    }

    if (wasSuccessful) {
        return (
            <>
                <Seo
                    title="Feedback"
                    description="Contanos cómo fue tu experiencia con The Dev House y qué mejorarías para ayudarte mejor a encontrar proyectos."
                />
                <div className="min-h-screen bg-background">
                    <LandingNav auth={auth} />
                    <section className="relative pt-32 pb-16 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background pointer-events-none" />
                        <div className="container mx-auto px-4 relative">
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-background border border-border rounded-lg p-12 text-center">
                                    <CheckCircle2 className="mx-auto mb-4 size-12 text-green-500" />
                                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                                        Feedback enviado
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Gracias por compartir tu experiencia. Esto nos ayuda a
                                        mejorar la app con criterio real de uso.
                                    </p>
                                    <a href={route('contact')}>
                                        <Button variant="outline">Enviar otra respuesta</Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                    <LandingFooter />
                </div>
            </>
        )
    }

    return (
        <>
            <Seo
                title="Feedback"
                description="Contanos cómo fue tu experiencia con The Dev House y qué mejorarías para ayudarte mejor a encontrar proyectos."
            />
            <div className="min-h-screen bg-background">
                <LandingNav auth={auth} />

                <section ref={heroRef} className="relative pt-32 pb-16 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background pointer-events-none" />
                    <div className="container mx-auto px-4 relative">
                        <div
                            className={cn(
                                'max-w-3xl mx-auto text-center transition-all duration-700',
                                heroInView
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8',
                            )}
                        >
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                Tu experiencia nos importa
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                                Queremos entender si la app se explica bien, si te sumarías a un
                                proyecto y qué te faltó para que la experiencia cierre de verdad.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="pb-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-background border border-border rounded-lg p-8 md:p-10 shadow-sm">
                                <div className="mb-8 rounded-lg border border-border/60 bg-accent/5 p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Buscamos feedback concreto. Nada de respuestas genéricas:
                                        queremos saber qué entendiste, qué te faltó y qué tipo de
                                        proyectos realmente te interesan.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-5"
                                    noValidate
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="name" className="text-foreground">
                                            Nombre <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Tu nombre"
                                            aria-invalid={!!errors.name}
                                        />
                                        <FormError message={errors.name} className="text-xs" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="email" className="text-foreground">
                                            Email <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            aria-invalid={!!errors.email}
                                        />
                                        <FormError message={errors.email} className="text-xs" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-foreground">
                                            ¿Qué tan satisfecho estuviste con la app?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.satisfaction}
                                            onValueChange={(value) =>
                                                setData('satisfaction', value || '')
                                            }
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-invalid={!!errors.satisfaction}
                                            >
                                                <SelectValue placeholder="Elegí un nivel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {satisfactionOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            message={errors.satisfaction}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-foreground">
                                            ¿Entendiste para qué sirve?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.understood_purpose}
                                            onValueChange={(value) =>
                                                setData('understood_purpose', value || '')
                                            }
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-invalid={!!errors.understood_purpose}
                                            >
                                                <SelectValue placeholder="Contanos cómo fue" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {understoodPurposeOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            message={errors.understood_purpose}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-foreground">
                                            ¿Te sumarías a un proyecto?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.would_join_project}
                                            onValueChange={(value) =>
                                                setData('would_join_project', value || '')
                                            }
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-invalid={!!errors.would_join_project}
                                            >
                                                <SelectValue placeholder="Elegí una respuesta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {joinProjectOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            message={errors.would_join_project}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label
                                            htmlFor="missing_feature"
                                            className="text-foreground"
                                        >
                                            ¿Qué te faltó?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="missing_feature"
                                            value={data.missing_feature}
                                            onChange={(e) =>
                                                setData('missing_feature', e.target.value)
                                            }
                                            placeholder="Ej: filtros más claros, onboarding, ejemplos de proyectos, más contexto..."
                                            rows={4}
                                            aria-invalid={!!errors.missing_feature}
                                        />
                                        <FormError
                                            message={errors.missing_feature}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="tech_stack" className="text-foreground">
                                            ¿Qué stack usás?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="tech_stack"
                                            value={data.tech_stack}
                                            onChange={(e) => setData('tech_stack', e.target.value)}
                                            placeholder="Ej: Laravel, React, TypeScript, PostgreSQL"
                                            aria-invalid={!!errors.tech_stack}
                                        />
                                        <FormError
                                            message={errors.tech_stack}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-foreground">
                                            ¿Qué tipo de proyectos preferís?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.preferred_project_type}
                                            onValueChange={(value) =>
                                                setData('preferred_project_type', value || '')
                                            }
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-invalid={!!errors.preferred_project_type}
                                            >
                                                <SelectValue placeholder="Elegí una opción" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {preferredProjectTypeOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            message={errors.preferred_project_type}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="improvements" className="text-foreground">
                                            ¿Qué mejorarías de la app?{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="improvements"
                                            value={data.improvements}
                                            onChange={(e) =>
                                                setData('improvements', e.target.value)
                                            }
                                            placeholder="Decinos qué cambiarías para que la app te resulte más útil o más clara."
                                            rows={5}
                                            aria-invalid={!!errors.improvements}
                                        />
                                        <FormError
                                            message={errors.improvements}
                                            className="text-xs"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        size="lg"
                                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            'Enviando...'
                                        ) : (
                                            <>
                                                <Send className="size-4" />
                                                Enviar feedback
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    )
}
