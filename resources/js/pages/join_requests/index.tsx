import Seo from '@/components/seo';
import { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Check, X, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JoinRequest, Project, User } from '@/types';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    receivedRequests: (JoinRequest & {
        applicant: User;
        project: Project;
    })[];
    sentRequests: (JoinRequest & {
        project: Project;
    })[];
}

export default function Index({ auth, receivedRequests, sentRequests }: Props) {
    const { post, processing } = useForm({});
    const [receivedItems, setReceivedItems] = useState(receivedRequests);
    const [sentItems, setSentItems] = useState(sentRequests);

    useEffect(() => {
        setReceivedItems(receivedRequests);
    }, [receivedRequests]);

    useEffect(() => {
        setSentItems(sentRequests);
    }, [sentRequests]);

    const handleApprove = (joinRequestId: number) => {
        const previousReceived = receivedItems;
        setReceivedItems((current) => current.filter((request) => request.id !== joinRequestId));

        post(route('join-requests.approve', joinRequestId), {
            onSuccess: () => toast.success('Solicitud aprobada'),
            onError: () => {
                setReceivedItems(previousReceived);
                toast.error('Error al aprobar la solicitud');
            },
        });
    };

    const handleReject = (joinRequestId: number) => {
        const previousReceived = receivedItems;
        setReceivedItems((current) => current.filter((request) => request.id !== joinRequestId));

        post(route('join-requests.reject', joinRequestId), {
            onSuccess: () => toast.success('Solicitud rechazada'),
            onError: () => {
                setReceivedItems(previousReceived);
                toast.error('Error al rechazar la solicitud');
            },
        });
    };

    const handleCancel = (joinRequestId: number) => {
        const previousSent = sentItems;
        setSentItems((current) => current.filter((request) => request.id !== joinRequestId));

        post(route('join-requests.cancel', joinRequestId), {
            onSuccess: () => toast.success('Solicitud cancelada'),
            onError: () => {
                setSentItems(previousSent);
                toast.error('Error al cancelar la solicitud');
            },
        });
    };

    return (
        <>
            <Seo title="Solicitudes de Unión" description="Revisá y gestioná las solicitudes de unión a tus proyectos en The Dev House." />
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        Solicitudes de Unión
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                        {/* Solicitudes Recibidas (como creator) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitudes Recibidas</CardTitle>
                                <CardDescription>
                                    Personas que quieren unirse a tus proyectos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {receivedItems.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No tenés solicitudes pendientes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {receivedItems.map((request) => (
                                            <div
                                                key={request.id}
                                                className="border rounded-lg p-4 flex justify-between items-center"
                                            >
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {request.applicant.name}
                                                    </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Quiere unirse a:{' '}
                                                            <Link
                                                                href={route('projects.show', request.project.slug)}
                                                                className="text-primary hover:underline"
                                                        >
                                                            {request.project.title}
                                                        </Link>
                                                    </p>
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            Mensaje: {request.message}
                                                        </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={processing}
                                                    >
                                                        <Check className="w-4 h-4" /> Aprobar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleReject(request.id)}
                                                        disabled={processing}
                                                    >
                                                        <X className="w-4 h-4" /> Rechazar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Solicitudes Enviadas (como applicant) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitudes Enviadas</CardTitle>
                                <CardDescription>
                                    Proyectos a los que solicitaste unirte
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {sentItems.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No enviaste solicitudes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {sentItems.map((request) => (
                                            <div
                                                key={request.id}
                                                className="border rounded-lg p-4 flex justify-between items-center"
                                            >
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {request.project.title}
                                                    </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Por: {request.project.creator?.name}
                                                        </p>
                                                    <Badge
                                                        variant={
                                                            request.status === 'approved'
                                                                ? 'default'
                                                                : request.status === 'rejected'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        <Clock className="w-3 h-3" />{' '}
                                                        {request.status === 'approved'
                                                            ? 'Aprobada'
                                                            : request.status === 'rejected'
                                                            ? 'Rechazada'
                                                            : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                                {request.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCancel(request.id)}
                                                        disabled={processing}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
