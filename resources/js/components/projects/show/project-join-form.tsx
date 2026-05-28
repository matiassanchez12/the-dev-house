import { Link, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { User } from '@/types';

interface ProjectJoinFormProps {
    projectId: number;
    isOpen: boolean;
    isCreator: boolean;
    user: User | null;
}

export function ProjectJoinForm({ projectId, isOpen, isCreator, user }: ProjectJoinFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    if (isCreator) {
        return null;
    }

    if (!isOpen) {
        return (
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle>¿Querés unirte?</CardTitle>
                    <CardDescription>
                        Este proyecto no acepta nuevas solicitudes
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle>¿Querés unirte?</CardTitle>
                    <CardDescription>
                        Iniciá sesión para enviar una solicitud
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Link href={route('login')}>
                            <Button variant="default">Iniciar Sesión</Button>
                        </Link>
                        <Link href={route('register')}>
                            <Button variant="outline">Registrarme</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('join-requests.store', projectId), {
            onSuccess: () => {
                reset('message');
                toast.success('Solicitud enviada exitosamente');
            },
            onError: () => {
                toast.error('Error al enviar la solicitud');
            },
        });
    };

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle>¿Querés unirte?</CardTitle>
                <CardDescription>
                    Envíale una solicitud al creador del proyecto
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="message">
                            Contale por qué querés participar *
                        </Label>
                        <Textarea
                            id="message"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Hola, me interesa este proyecto porque..."
                            rows={4}
                            required
                        />
                        {errors.message && (
                            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={processing}>
                        <Send className="size-4" data-icon="inline-start" />
                        {processing ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
