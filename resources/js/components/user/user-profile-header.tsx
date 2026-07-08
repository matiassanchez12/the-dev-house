import { useId, useState } from 'react'
import { ChevronDown, Lock, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/types'
import { SocialLinksDisplay } from './social-links-display'
import { avatarUrl } from '@/components/projects/project-utils'
import { cn } from '@/lib/utils'

interface UserProfileHeaderProps {
    user: UserProfile
}

const BIO_TOGGLE_LENGTH = 180

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false)
    const bioId = useId()
    const bio = user.bio?.trim()
    const email = user.email?.trim()
    const phone = user.phone?.trim()
    const shouldShowBioToggle = Boolean(bio && bio.length > BIO_TOGGLE_LENGTH)

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const memberDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('es-ES', {
              month: 'long',
              year: 'numeric',
          })
        : null

    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="size-20 ring-2 ring-border">
                <AvatarImage src={avatarUrl(user.avatar) ?? undefined} alt={user.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-display font-bold text-foreground">{user.name}</h1>
                {bio && (
                    <div className="mt-2 max-w-xl">
                        <p
                            id={bioId}
                            className={cn(
                                'text-muted-foreground whitespace-pre-wrap break-words',
                                !isBioExpanded && 'line-clamp-3',
                            )}
                        >
                            {bio}
                        </p>
                        {shouldShowBioToggle && (
                            <Button
                                type="button"
                                variant="link"
                                size="xs"
                                className="mt-1 h-auto px-0"
                                aria-expanded={isBioExpanded}
                                aria-controls={bioId}
                                onClick={() => setIsBioExpanded((current) => !current)}
                            >
                                {isBioExpanded ? 'Ver menos' : 'Ver más'}
                                <ChevronDown
                                    data-icon="inline-end"
                                    className={cn(
                                        'transition-transform',
                                        isBioExpanded && 'rotate-180',
                                    )}
                                />
                            </Button>
                        )}
                    </div>
                )}
                {memberDate && (
                    <p className="mt-2 text-xs text-muted-foreground/70">
                        Miembro desde {memberDate}
                    </p>
                )}
                <div className="mt-3">
                    <SocialLinksDisplay links={user.socialLinks ?? []} />
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <Mail className="size-4 shrink-0" aria-hidden="true" />
                        {email ? (
                            <a href={`mailto:${email}`} className="text-foreground hover:underline">
                                {email}
                            </a>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Lock className="size-3.5" aria-hidden="true" />
                                <span>Correo electrónico privado</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <Phone className="size-4 shrink-0" aria-hidden="true" />
                        {phone ? (
                            <a href={`tel:${phone}`} className="text-foreground hover:underline">
                                {phone}
                            </a>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Lock className="size-3.5" aria-hidden="true" />
                                <span>Teléfono privado</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
