import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectChat } from '@/components/projects/show';
import type { Project as ProjectType, User } from '@/types';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    project: ProjectType & {
        creator: User;
        participants: User[];
        messages?: ProjectType['messages'];
    };
}

export default function Chat({ auth, project }: Props) {
    return (
        <AppLayout>
            <Seo title={`${project.title} · Chat`} description={`Chat del proyecto ${project.title}`} />

            <div className="mx-auto flex h-[calc(100dvh-3.9rem)] max-w-6xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-8 md:h-[calc(100vh-4.1rem)] lg:px-8">
                <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chat del proyecto</p>
                        <h2 className="truncate font-semibold text-xl text-foreground leading-tight">{project.title}</h2>
                    </div>
                    <Link href={route('projects.show', project.slug)}>
                        <Button variant="outline" size="sm" className="shrink-0 gap-2">
                            <ArrowLeft className="size-4" />
                            Volver al proyecto
                        </Button>
                    </Link>
                </div>

                <div className="flex min-h-0 flex-1 pb-4">
                    <ProjectChat
                        projectId={project.id}
                        projectSlug={project.slug}
                        currentUserId={auth.user?.id}
                        messages={project.messages}
                        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
                        contentClassName="flex min-h-0 flex-1 flex-col"
                        messagesClassName="min-h-0 flex-1"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
