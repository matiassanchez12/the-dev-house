import { SocialLink } from '@/types';
import { getSocialIcon, getSocialLabel } from '@/lib/social-icons';

interface Props {
    links: SocialLink[];
}

export function SocialLinksDisplay({ links }: Props) {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {links.map((link) => (
                <a
                    key={link.id ?? link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${getSocialLabel(link.platform)} profile`}
                    className="text-muted-foreground hover:text-primary hover:scale-110 transition-colors"
                >
                    {getSocialIcon(link.platform)}
                </a>
            ))}
        </div>
    );
}
