import { Head, Link, useForm } from '@inertiajs/react';
import { CircleDot, CheckCircle, CircleX, GitBranch, ExternalLink, Send } from 'lucide-react';
import PublicLayout from '@/layouts/public';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

    return (
        <>
            <Head title={project.title} />
            <PublicLayout
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
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        {/* Imagen principal */}
                        {project.images && project.images.length > 0 && (
                            <Card>
                                <CardContent className="p-0">
                                    <img
                                        src={`/storage/${project.images[0]}`}
                                        alt={project.title}
                                        className="w-full h-64 object-cover rounded-t-lg"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Información principal */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {project.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Por:{' '}
                                            <Link
                                                href={route('users.show', project.creator.slug)}
                                                className="hover:underline text-foreground font-medium"
                                            >
                                                {project.creator.name}
                                            </Link>
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`gap-1.5 ${
                                            project.status === 'open'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : project.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                : ''
                                        }`}
                                    >
                                        {project.status === 'open' && (
                                            <>
                                                <CircleDot className="size-3" />
                                                Abierto
                                            </>
                                        )}
                                        {project.status === 'completed' && (
                                            <>
                                                <CheckCircle className="size-3" />
                                                Completado
                                            </>
                                        )}
                                        {project.status === 'closed' && (
                                            <>
                                                <CircleX className="size-3" />
                                                Cerrado
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Descripción</h3>
                                    <p className="text-foreground whitespace-pre-line">
                                        {project.description}
                                    </p>
                                </div>

                                {project.vision && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Visión</h3>
                                        <p className="text-foreground whitespace-pre-line">
                                            {project.vision}
                                        </p>
                                    </div>
                                )}

                                {/* Tech Stack */}
                                {project.techs && project.techs.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Tecnologías</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.techs.map((tech) => (
                                                <Badge key={tech.id} variant="secondary">
                                                    {tech.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* URLs */}
                                <div className="flex gap-4 pt-4">
                                    {project.repository_url && (
                                        <a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline inline-flex items-center gap-1"
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
                                            className="text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            <ExternalLink className="size-4" />
                                            Ver <span className="hidden sm:inline">Demo</span>
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Galería de imágenes */}
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

                        {/* Participantes */}
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

                        {/* Botón para unirse (si está abierto, no es el creator, y está logueado) */}
                        {!isCreator && project.status === 'open' && auth.user && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>¿Querés unirte?</CardTitle>
                                    <CardDescription>
                                        Envíale una solicitud al creator del proyecto
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleJoinRequest} className="space-y-4">
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
                                            <Send className="size-4 mr-2" />
                                            {processing ? 'Enviando...' : 'Enviar Solicitud'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Mensaje para usuarios no autenticados */}
                        {!isCreator && project.status === 'open' && !auth.user && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>¿Querés unirte?</CardTitle>
                                    <CardDescription>
                                        Iniciá sesión para enviar una solicitud
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Link href={route('login')}>
                                            <Button variant="default">
                                                Iniciar Sesión
                                            </Button>
                                        </Link>
                                        <Link href={route('register')}>
                                            <Button variant="outline">
                                                Registrarme
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
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
            </PublicLayout>
        </>
    );
}
