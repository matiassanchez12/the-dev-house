import { Link, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { JoinRequest, User } from '@/types';
import InputError from '@/components/input-error';

interface ProjectJoinFormProps {
    projectId: number;
    isOpen: boolean;
    isCreator: boolean;
    user: User | null;
    viewerJoinRequest?: Pick<JoinRequest, 'id' | 'status'> | null;
}

export function ProjectJoinForm({ projectId, isOpen, isCreator, user, viewerJoinRequest }: ProjectJoinFormProps) {
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

    if (viewerJoinRequest?.status === 'pending') {
        return (
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle>Solicitud enviada</CardTitle>
                    <CardDescription>
                        Ya enviaste una solicitud para unirte a este proyecto.
                    </CardDescription>
                </CardHeader>
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
                            className="mt-1 block w-full"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Hola, me interesa este proyecto porque..."
                            rows={4}
                            required
                        />
                        {errors.message && (
                            <InputError className="mt-2" message={errors.message} />
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
