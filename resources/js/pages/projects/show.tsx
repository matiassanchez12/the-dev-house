import { Head, Link, useForm } from '@inertiajs/react';
import { CircleDot, CheckCircle, CircleX, GitBranch, ExternalLink, Send, User as UserIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Project as ProjectType, Tech, User } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    project: ProjectType & {
        creator: User;
        techs: Tech[];
        participants: User[];
    };
}

const statusConfig = {
    open: { label: 'Abierto', icon: CircleDot, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    completed: { label: 'Completado', icon: CheckCircle, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    closed: { label: 'Cerrado', icon: CircleX, className: 'bg-muted text-foreground' },
};

export default function Show({ auth, project }: Props) {
    const { delete: destroy } = useForm({});
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        destroy(route('projects.destroy', project.slug), {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success('Proyecto eliminado exitosamente');
            },
            onError: () => toast.error('Error al eliminar el proyecto'),
        });
    };

    const handleJoinRequest = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('join-requests.store', project.id), {
            onSuccess: () => {
                reset('message');
                toast.success('Solicitud de unión enviada');
            },
            onError: () => toast.error('Error al enviar la solicitud'),
        });
    };

    const isCreator = auth.user?.id === project.user_id;
    const status = statusConfig[project.status] ?? statusConfig.closed;
    const StatusIcon = status.icon;

    const creatorInitials = project.creator.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
            <Head title={project.title} />
            <AppLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-foreground leading-tight">
                            {project.title}
                        </h2>
                        {isCreator && (
                            <div className="flex gap-2">
                                <Link href={route('projects.edit', project.slug)}>
                                    <Button variant="outline">Editar</Button>
                                </Link>
                                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </div>
                }
            >
                <div className="py-8">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        {/* Hero Section */}
                        {project.images && project.images.length > 0 ? (
                            <div className="relative mb-8 overflow-hidden rounded-xl">
                                <img
                                    src={`/storage/${project.images[0]}`}
                                    alt={project.title}
                                    className="w-full h-64 sm:h-80 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="flex items-center gap-3">
                                        <Badge className={status.className}>
                                            <StatusIcon className="size-3" />
                                            {status.label}
                                        </Badge>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h1>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-8">
                                <div className="flex items-center gap-4">
                                    <Badge className={status.className}>
                                        <StatusIcon className="size-3" />
                                        {status.label}
                                    </Badge>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{project.title}</h1>
                                </div>
                            </div>
                        )}

                        {/* Two-column Layout */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Content (2 cols) */}
                            <div className="flex flex-col gap-6 lg:col-span-2">
                                {/* Description & Vision */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descripción</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground whitespace-pre-line">
                                            {project.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                {project.vision && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Visión</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-foreground whitespace-pre-line">
                                                {project.vision}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Gallery */}
                                {project.images && project.images.length > 1 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Galería</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {project.images.slice(1).map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={`/storage/${image}`}
                                                        alt={`${project.title} - ${index + 2}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Participants */}
                                {project.participants && project.participants.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Participantes ({project.participants.length})</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {project.participants.map((participant) => (
                                                    <Badge key={participant.id} variant="outline">
                                                        {participant.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Sidebar (1 col) */}
                            <div className="flex flex-col gap-6">
                                {/* Creator Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Creador</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link
                                            href={route('users.show', project.creator.slug)}
                                            className="flex items-center gap-3 group"
                                        >
                                            <Avatar className="size-10">
                                                <AvatarImage src={project.creator.avatar ?? undefined} alt={project.creator.name} />
                                                <AvatarFallback>{creatorInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground group-hover:underline">
                                                    {project.creator.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">Ver perfil</span>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>

                                {/* Techs */}
                                {project.techs && project.techs.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Tecnologías</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {project.techs.map((tech) => (
                                                    <Badge key={tech.id} variant="secondary">
                                                        {tech.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* External Links */}
                                {(project.repository_url || project.demo_url) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Enlaces</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-3">
                                            {project.repository_url && (
                                                <a
                                                    href={project.repository_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-2"
                                                >
                                                    <GitBranch className="size-4" />
                                                    Ver Repositorio
                                                </a>
                                            )}
                                            {project.demo_url && (
                                                <a
                                                    href={project.demo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-2"
                                                >
                                                    <ExternalLink className="size-4" />
                                                    Ver Demo
                                                </a>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Join Request */}
                                {!isCreator && project.status === 'open' && auth.user && (
                                    <Card className="border-primary/20">
                                        <CardHeader>
                                            <CardTitle>¿Querés unirte?</CardTitle>
                                            <CardDescription>
                                                Envíale una solicitud al creador del proyecto
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleJoinRequest} className="flex flex-col gap-4">
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
                                )}

                                {/* Not authenticated */}
                                {!isCreator && project.status === 'open' && !auth.user && (
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar Proyecto</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que querés eliminar este proyecto? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
