import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types';
import { SocialLinksDisplay } from './social-links-display';

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

    const memberDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
        })
        : null;

    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="size-20 ring-2 ring-border">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-display font-bold text-foreground">{user.name}</h1>
                {user.bio && (
                    <p className="mt-2 text-muted-foreground max-w-xl line-clamp-3">{user.bio}</p>
                )}
                {memberDate && (
                    <p className="mt-2 text-xs text-muted-foreground/70">
                        Miembro desde {memberDate}
                    </p>
                )}
                <div className="mt-3">
                    <SocialLinksDisplay links={user.socialLinks ?? []} />
                </div>
            </div>
        </div>
    );
}
