import { FormError } from '@/components/ui/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm } from '@inertiajs/react';
import { Trash2, Plus } from 'lucide-react';
import { SocialLink } from '@/types';
import { getSocialIcon, getSocialLabel, SOCIAL_PLATFORMS } from '@/lib/social-icons';
import { Transition } from '@headlessui/react';
import { toast } from 'sonner';

interface Props {
    socialLinks: SocialLink[];
    className?: string;
}

interface FormLink {
    id?: number;
    platform: string;
    url: string;
}

export default function SocialLinksEditForm({ socialLinks, className = '' }: Props) {
    // Gate: don't render if dependency not ready
    if (!socialLinks) {
        return null;
    }

    const initialLinks: FormLink[] = socialLinks.length > 0
        ? socialLinks.map((link) => ({ id: link.id, platform: link.platform, url: link.url }))
        : [{ platform: '', url: '' }];

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        links: initialLinks,
    });

    const addLink = () => {
        setData('links', [...data.links, { platform: '', url: '' }]);
    };

    const removeLink = (index: number) => {
        const link = data.links[index];

        // If it's a saved link, delete it individually
        if (link.id) {
            router.delete(route('social-links.destroy', { socialLink: link.id }), {
                preserveScroll: true,
                onSuccess: () => toast.success('Link eliminado'),
                onError: () => toast.error('Error al eliminar el link'),
            });
        } else {
            // Just remove from local state (unsaved)
            const newLinks = [...data.links];
            newLinks.splice(index, 1);
            setData('links', newLinks);
        }
    };

    const updateLink = (index: number, field: keyof FormLink, value: string) => {
        const newLinks = [...data.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setData('links', newLinks);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty rows
        const validLinks = data.links.filter(
            (link) => link.platform !== '' && link.url !== ''
        );

        console.log('SocialLinks submit', {
            links: data.links,
            validLinks,
        });

        if (validLinks.length === 0) {
            // Submit empty array to clear all links
            setData('links', []);
        } else {
            setData('links', validLinks);
        }

        put(route('social-links.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Links sociales actualizados'),
            onError: () => toast.error('Error al actualizar los links'),
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-foreground">Links Sociales</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addLink}>
                        <Plus className="size-4 mr-1" />
                        Agregar link
                    </Button>
                </div>

                <div className="space-y-3">
                    {data.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {/* Platform icon */}
                            <div className="shrink-0 text-muted-foreground">
                                {link.platform ? getSocialIcon(link.platform) : null}
                            </div>

                            {/* Platform selector */}
                            <div className="w-40">
                                <Select
                                    value={link.platform}
                                    onValueChange={(value) => updateLink(index, 'platform', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Plataforma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOCIAL_PLATFORMS.map((platform) => (
                                            <SelectItem key={platform.slug} value={platform.slug}>
                                                {platform.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* URL input */}
                            <div className="flex-1">
                                <Input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Remove button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeLink(index)}
                                disabled={!link.id && !link.platform}
                            >
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <FormError message={errors.links} className="mt-2" />

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>Guardar Cambios</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
