import { Head, Link, useForm } from '@inertiajs/react';
import {
    Folder,
    Users,
    MessageSquare,
    CheckCircle,
    Check,
    X,
    Clock,
    Plus,
    ArrowRight,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, JoinRequest, User, Tech } from '@/types';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';

interface DashboardProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    stats: {
        projects_created: number;
        projects_joined: number;
        pending_requests_received: number;
        requests_approved: number;
    };
    createdProjects: (Project & {
        techs: Tech[];
        participants: User[];
        join_requests_count: number;
    })[];
    participatingProjects: (Project & {
        creator: User;
        techs: Tech[];
        pivot: {
            role: string | null;
            joined_at: string | null;
        };
    })[];
    pendingRequests: (JoinRequest & {
        applicant: User;
        project: Project;
    })[];
    sentRequests: (JoinRequest & {
        project: Project;
    })[];
}

export default function Dashboard({
    auth,
    stats,
    createdProjects,
    participatingProjects,
    pendingRequests,
    sentRequests,
}: DashboardProps) {
    const { post, processing } = useForm({});

    const handleApproveRequest = (joinRequestId: number) => {
        post(route('join-requests.approve', joinRequestId));
    };

    const handleRejectRequest = (joinRequestId: number) => {
        post(route('join-requests.reject', joinRequestId));
    };

    return (
        <>
            <Head title="Dashboard" />
            <AppLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-foreground leading-tight">
                            Hola, {auth.user?.name}
                        </h2>
                        <Link href={route('projects.create')}>
                            <Button variant='default'>
                                <Plus className="size-4 mr-2" />
                                Crear Proyecto
                            </Button>
                        </Link>
                    </div>
                }
            >
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                        {/* === ESTADÍSTICAS === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Mis Proyectos
                                    </CardTitle>
                                    <Folder className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.projects_created}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Proyectos creados
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Unido a
                                    </CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.projects_joined}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Proyectos como participante
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Solicitudes Pendientes
                                    </CardTitle>
                                    <MessageSquare className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.pending_requests_received}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Esperan tu respuesta
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Aprobadas
                                    </CardTitle>
                                    <CheckCircle className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.requests_approved}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Solicitudes aprobadas
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* === MIS PROYECTOS (como creator) === */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Mis Proyectos</CardTitle>
                                            <CardDescription>
                                                Proyectos que creaste y estás liderando
                                            </CardDescription>
                                        </div>
                                        <Link href={route('projects.index')}>
                                            <Button variant="outline" size="sm">
                                                Ver todos
                                                <ArrowRight className="size-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {createdProjects.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-4">
                                                Aún no creaste ningún proyecto
                                            </p>
                                            <Link href={route('projects.create')}>
                                                <Button>Crear mi primer proyecto</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {createdProjects.map((project) => (
                                                <Card key={project.id} className="relative pb-0">
                                                    {project.join_requests_count > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                                            {project.join_requests_count}
                                                        </div>
                                                    )}
                                                    <CardHeader>
                                                        <CardTitle className="text-base">
                                                            <Link
                                                                href={route(
                                                                    'projects.show',
                                                                    project.slug
                                                                )}
                                                                className="hover:text-primary"
                                                            >
                                                                {project.title}
                                                            </Link>
                                                        </CardTitle>
                                                        <CardDescription className="line-clamp-2">
                                                            {project.description}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {project.techs
                                                                ?.slice(0, 3)
                                                                .map((tech) => (
                                                                    <Badge
                                                                        key={tech.id}
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        {tech.name}
                                                                    </Badge>
                                                                ))}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {project.participants
                                                                ?.length || 0}{' '}
                                                            participantes
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter>
                                                        <ProjectStatusBadge status={project.status} />
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* === PROYECTOS DONDE PARTICIPO === */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>
                                                Proyectos donde Participo
                                            </CardTitle>
                                            <CardDescription>
                                                Proyectos a los que te uniste como
                                                colaborador
                                            </CardDescription>
                                        </div>
                                        <Link href={route('projects.index')}>
                                            <Button variant="outline" size="sm">
                                                Explorar más
                                                <ArrowRight className="size-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {participatingProjects.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                Aún no te uniste a ningún proyecto
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {participatingProjects.map(
                                                (project) => (
                                                    <Card key={project.id}>
                                                        <CardHeader>
                                                            <CardTitle className="text-base">
                                                                <Link
                                                                    href={route(
                                                                        'projects.show',
                                                                        project.slug
                                                                    )}
                                                                    className="hover:text-primary"
                                                                >
                                                                    {
                                                                        project.title
                                                                    }
                                                                </Link>
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Por:{' '}
                                                                {
                                                                    project.creator
                                                                        ?.name
                                                                }
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {project.pivot
                                                                ?.role && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mb-2"
                                                                >
                                                                    {
                                                                        project
                                                                            .pivot.role
                                                                    }
                                                                </Badge>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                {project.techs
                                                                    ?.length || 0}{' '}
                                                                tecnologías
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* === SOLICITUDES PENDIENTES (recibidas) === */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>
                                                Solicitudes Pendientes
                                            </CardTitle>
                                            <CardDescription>
                                                Personas que quieren unirse a tus
                                                proyectos
                                            </CardDescription>
                                        </div>
                                        <Link href={route('join-requests.index')}>
                                            <Button variant="outline" size="sm">
                                                Ver todas
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {pendingRequests.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            No tenés solicitudes pendientes
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="border rounded-lg p-3 space-y-2"
                                                >
                                                    <div>
                                                        <h4 className="font-semibold text-sm">
                                                            {
                                                                request
                                                                    .applicant.name
                                                            }
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Quiere unirse a:{' '}
                                                            <span className="font-medium">
                                                                {
                                                                    request
                                                                        .project
                                                                        .title
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleApproveRequest(
                                                                    request.id
                                                                )
                                                            }
                                                            disabled={processing}
                                                            className="flex-1 text-xs"
                                                        >
                                                            <Check className="size-3 mr-1" />
                                                            Aprobar
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRejectRequest(
                                                                    request.id
                                                                )
                                                            }
                                                            disabled={processing}
                                                            className="flex-1 text-xs"
                                                        >
                                                            <X className="size-3 mr-1" />
                                                            Rechazar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* === SOLICITUDES ENVIADAS === */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Mis Solicitudes</CardTitle>
                                            <CardDescription>
                                                Solicitudes que enviaste y esperan
                                                respuesta
                                            </CardDescription>
                                        </div>
                                        <Link href={route('join-requests.index')}>
                                            <Button variant="outline" size="sm">
                                                Ver historial
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {sentRequests.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            No enviaste solicitudes
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {sentRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="border rounded-lg p-3"
                                                >
                                                    <h4 className="font-semibold text-sm">
                                                        {request.project.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Por:{' '}
                                                        {
                                                            request.project.creator
                                                                ?.name
                                                        }
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        <Clock className="size-3 mr-1" />
                                                        Pendiente de aprobación
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
