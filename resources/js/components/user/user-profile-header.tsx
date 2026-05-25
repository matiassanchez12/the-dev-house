import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types';

interface UserProfileHeaderProps {
    user: UserProfile;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar size="lg">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                {user.bio && (
                    <p className="mt-2 text-muted-foreground max-w-xl">{user.bio}</p>
                )}
                {user.created_at && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Miembro desde {new Date(user.created_at).toLocaleDateString('es-ES', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}
