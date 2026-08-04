import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell, BellRing, Users } from 'lucide-react';
import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ProjectFollowCardProps {
    projectSlug: string;
    followersCount: number;
    followersPreview?: User[];
    isAuthenticated: boolean;
    isFollowing?: boolean;
    readOnly?: boolean;
    onImageBackground?: boolean;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getFollowerTitle(followersCount: number, readOnly: boolean): string {
    if (followersCount === 0) {
        return readOnly ? 'Todavía no tenés seguidores' : 'Sé el primero en seguir este proyecto';
    }

    const peopleLabel = followersCount === 1 ? '1 persona sigue' : `${followersCount} personas siguen`;

    return readOnly ? `${peopleLabel} tu proyecto` : `${peopleLabel} este proyecto`;
}

function FollowerSubtext({
    followersCount,
    isFollowing,
    readOnly,
    onImageBackground,
}: {
    followersCount: number;
    isFollowing: boolean;
    readOnly: boolean;
    onImageBackground: boolean;
}) {
    if (followersCount === 0) {
        return (
            <p className={cn('text-xs', onImageBackground ? 'text-white/80' : 'text-muted-foreground')}>
                {readOnly
                    ? 'Compartí tu proyecto para que más gente lo descubra y lo siga'
                    : 'Recibí novedades apenas haya actividad'}
            </p>
        );
    }

    if (readOnly) {
        return <p className={cn('text-xs', onImageBackground ? 'text-white/80' : 'text-muted-foreground')}>Tu proyecto está generando interés</p>;
    }

    if (followersCount === 1 && isFollowing) {
        return <p className={cn('text-xs', onImageBackground ? 'text-white/80' : 'text-muted-foreground')}>Vos sos el único que sigue este proyecto</p>;
    }

    return <p className={cn('text-xs', onImageBackground ? 'text-white/80' : 'text-muted-foreground')}>Sumate para recibir las novedades</p>;
}

export function ProjectFollowCard({
    projectSlug,
    followersCount,
    followersPreview = [],
    isAuthenticated,
    isFollowing = false,
    readOnly = false,
    onImageBackground = false,
}: ProjectFollowCardProps) {
    const [processing, setProcessing] = useState(false);
    const [guestDialogOpen, setGuestDialogOpen] = useState(false);
    const visibleFollowers = followersPreview.slice(0, Math.min(3, followersCount));
    const hiddenFollowersCount = Math.max(followersCount - visibleFollowers.length, 0);

    const handleFollow = () => {
        setProcessing(true);

        router.post(route('projects.follow', projectSlug), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Ahora estas siguiente este proyecto!'),
            onError: () => toast.error('No pudimos completas el proceso con exito.'),
            onFinish: () => setProcessing(false),
        });
    };

    const handleUnfollow = () => {
        setProcessing(true);

        router.delete(route('projects.unfollow', projectSlug), {
            preserveScroll: true,
            onSuccess: () => toast.success('Dejaste de seguir el proyecto con exito.'),
            onError: () => toast.error('No pudimos completar el proceso con exito.'),
            onFinish: () => setProcessing(false),
        });
    };

    const handleGuestFollow = () => {
        setGuestDialogOpen(true);
    };

    if (processing) {
        return (
            <Card className="border-border/60 bg-card shadow-sm">
                <CardContent className="flex items-center justify-between gap-3 p-5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-[38px] rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'shadow-sm backdrop-blur-md',
                onImageBackground
                    ? 'border-white/15 bg-black/45 text-white shadow-black/25 supports-[backdrop-filter]:bg-black/35'
                    : 'border-border/70 bg-background/90 supports-[backdrop-filter]:bg-background/80',
            )}
        >
            <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                    {followersCount === 0 || visibleFollowers.length === 0 ? (
                        <div
                            className={cn(
                                'flex size-[38px] shrink-0 items-center justify-center rounded-full',
                                onImageBackground ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary',
                            )}
                        >
                            <Users className="size-5" aria-hidden="true" />
                        </div>
                    ) : (
                        <AvatarGroup>
                            {visibleFollowers.map((follower) => (
                                <Avatar key={follower.id} size="sm">
                                    <AvatarImage src={follower.avatar ?? undefined} alt={follower.name} />
                                    <AvatarFallback>{getInitials(follower.name)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {hiddenFollowersCount > 0 && (
                                <AvatarGroupCount>+{hiddenFollowersCount}</AvatarGroupCount>
                            )}
                        </AvatarGroup>
                    )}

                    <div>
                        <p className={cn('text-sm font-medium', onImageBackground ? 'text-white' : 'text-foreground')}>
                            {getFollowerTitle(followersCount, readOnly)}
                        </p>
                        <FollowerSubtext
                            followersCount={followersCount}
                            isFollowing={isFollowing}
                            readOnly={readOnly}
                            onImageBackground={onImageBackground}
                        />
                    </div>
                </div>

                {readOnly ? null : isAuthenticated ? (
                    <Button
                        type="button"
                        variant={isFollowing ? 'default' : 'outline'}
                        size="sm"
                        aria-pressed={isFollowing}
                        className={cn(
                            onImageBackground && !isFollowing && 'border-white/20 bg-black/25 text-white hover:bg-black/40 hover:text-white',
                        )}
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                    >
                        {isFollowing ? (
                            <>
                                <BellRing className="me-1 size-4" aria-hidden="true" />
                                Siguiendo
                            </>
                        ) : (
                            <>
                                <Bell className="me-1 size-4" aria-hidden="true" />
                                Seguir
                            </>
                        )}
                    </Button>
                ) : (
                    <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
                        <DialogTrigger
                            render={(
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        onImageBackground && 'border-white/20 bg-black/25 text-white hover:bg-black/40 hover:text-white',
                                    )}
                                    onClick={handleGuestFollow}
                                />
                            )}
                        >
                            <Bell className="me-1 size-4" aria-hidden="true" />
                            Seguir
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Seguí este proyecto</DialogTitle>
                                <DialogDescription>
                                    Creá una cuenta o iniciá sesión para seguir este proyecto y enterarte de las novedades.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Link
                                    href={route('login')}
                                    className={buttonVariants({ className: 'flex-1 justify-center' })}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className={buttonVariants({ variant: 'outline', className: 'flex-1 justify-center' })}
                                >
                                    Crear cuenta
                                </Link>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>

            <div aria-live="polite" className="sr-only">
                {isFollowing ? 'Ahora seguís este proyecto' : ''}
            </div>
        </Card>
    );
}
