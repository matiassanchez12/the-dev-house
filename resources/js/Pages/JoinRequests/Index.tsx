import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JoinRequest, Project, User } from '@/types';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
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

    const handleApprove = (joinRequestId: number) => {
        post(route('join-requests.approve', joinRequestId));
    };

    const handleReject = (joinRequestId: number) => {
        post(route('join-requests.reject', joinRequestId));
    };

    const handleCancel = (joinRequestId: number) => {
        post(route('join-requests.cancel', joinRequestId));
    };

    return (
        <>
            <Head title="Solicitudes de Unión" />
            <AuthenticatedLayout
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
                                {receivedRequests.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No tenés solicitudes pendientes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {receivedRequests.map((request) => (
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
                                                        ✅ Aprobar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleReject(request.id)}
                                                        disabled={processing}
                                                    >
                                                        ❌ Rechazar
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
                                {sentRequests.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No enviaste solicitudes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {sentRequests.map((request) => (
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
                                                        {request.status === 'approved'
                                                            ? '✅ Aprobada'
                                                            : request.status === 'rejected'
                                                            ? '❌ Rechazada'
                                                            : '⏳ Pendiente'}
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
            </AuthenticatedLayout>
        </>
    );
}
