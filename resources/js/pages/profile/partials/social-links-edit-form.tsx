import { Button } from '@/components/ui/button'
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getSocialIcon, SOCIAL_PLATFORMS } from '@/lib/social-icons'
import { router, useForm } from '@inertiajs/react'
import { Plus, Trash2 } from 'lucide-react'
import { SocialLink } from '@/types'
import { Transition } from '@headlessui/react'
import { toast } from 'sonner'

interface Props {
    socialLinks: SocialLink[]
    className?: string
}

interface FormLink {
    id?: number
    platform: string
    url: string
}

function normalizeLinks(links: FormLink[]) {
    return links.filter((link) => link.platform !== '' && link.url !== '')
}

export default function SocialLinksEditForm({ socialLinks, className = '' }: Props) {
    const initialLinks: FormLink[] =
        socialLinks.length > 0
            ? socialLinks.map((link) => ({ id: link.id, platform: link.platform, url: link.url }))
            : [{ platform: '', url: '' }]

    const { data, setData, put, processing, errors, recentlySuccessful, transform } = useForm({
        links: initialLinks,
    })

    const fieldErrors = errors as Record<string, string | undefined>

    const addLink = () => {
        setData('links', [...data.links, { platform: '', url: '' }])
    }

    const removeLink = (index: number) => {
        const link = data.links[index]

        // If it's a saved link, delete it individually
        if (link.id) {
            router.delete(route('social-links.destroy', { socialLink: link.id }), {
                preserveScroll: true,
                onSuccess: () => toast.success('Link eliminado'),
                onError: () => toast.error('Error al eliminar el link'),
            })
        } else {
            // Just remove from local state (unsaved)
            const newLinks = [...data.links]
            newLinks.splice(index, 1)
            setData('links', newLinks)
        }
    }

    const updateLink = (index: number, field: keyof FormLink, value: string) => {
        const newLinks = [...data.links]
        newLinks[index] = { ...newLinks[index], [field]: value }
        setData('links', newLinks)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        transform((formData) => ({
            ...formData,
            links: normalizeLinks(formData.links),
        }))

        put(route('social-links.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Links sociales actualizados'),
            onError: () => toast.error('Error al actualizar los links'),
        })
    }

    return (
        <Card className={className}>
            <CardHeader>
                <h3 className="font-heading text-sm font-medium group-data-[size=sm]/card:text-sm">
                    Links Sociales
                </h3>
                <CardAction>
                    <Button type="button" variant="outline" size="sm" onClick={addLink}>
                        <Plus data-icon="inline-start" />
                        Agregar link
                    </Button>
                </CardAction>
            </CardHeader>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <CardContent className="flex flex-col gap-4">
                    {data.links.map((link, index) => {
                        const platformErrorId = `social-link-platform-${index}-error`
                        const urlErrorId = `social-link-url-${index}-error`

                        return (
                            <div
                                key={link.id ?? `new-${index}`}
                                className="rounded-none border border-border/60 p-4"
                            >
                                <div className="grid gap-4 md:grid-cols-[auto_minmax(0,11rem)_minmax(0,1fr)_auto] md:items-start">
                                    <div className="pt-7 text-muted-foreground">
                                        {link.platform ? getSocialIcon(link.platform) : null}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`social-link-platform-${index}`}>
                                            Plataforma
                                        </Label>
                                        <Select
                                            value={link.platform}
                                            onValueChange={(value) =>
                                                updateLink(index, 'platform', value ?? '')
                                            }
                                        >
                                            <SelectTrigger
                                                id={`social-link-platform-${index}`}
                                                className="w-full"
                                                aria-describedby={
                                                    fieldErrors[`links.${index}.platform`]
                                                        ? platformErrorId
                                                        : undefined
                                                }
                                                aria-invalid={
                                                    fieldErrors[`links.${index}.platform`]
                                                        ? true
                                                        : undefined
                                                }
                                            >
                                                <SelectValue placeholder="Plataforma" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {SOCIAL_PLATFORMS.map((platform) => (
                                                        <SelectItem
                                                            key={platform.slug}
                                                            value={platform.slug}
                                                        >
                                                            {platform.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            id={platformErrorId}
                                            message={fieldErrors[`links.${index}.platform`]}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`social-link-url-${index}`}>URL</Label>
                                        <Input
                                            id={`social-link-url-${index}`}
                                            type="url"
                                            value={link.url}
                                            onChange={(e) =>
                                                updateLink(index, 'url', e.target.value)
                                            }
                                            placeholder="https://..."
                                            aria-describedby={
                                                fieldErrors[`links.${index}.url`]
                                                    ? urlErrorId
                                                    : undefined
                                            }
                                            aria-invalid={
                                                fieldErrors[`links.${index}.url`]
                                                    ? 'true'
                                                    : undefined
                                            }
                                        />
                                        <FormError
                                            id={urlErrorId}
                                            message={fieldErrors[`links.${index}.url`]}
                                        />
                                    </div>

                                    <div className="flex md:pt-7">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => removeLink(index)}
                                            disabled={!link.id && !link.platform}
                                            aria-label="Eliminar link"
                                        >
                                            <Trash2 className="text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <FormError message={errors.links} />
                </CardContent>

                <CardFooter className="flex-wrap gap-4">
                    <Button type="submit" disabled={processing}>
                        Guardar Cambios
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Guardado.</p>
                    </Transition>
                </CardFooter>
            </form>
        </Card>
    )
}
