import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Message, Project as ProjectType, Tech, User } from '@/types';
import {
    ProjectHero,
    ProjectDescription,
    ProjectVision,
    ProjectGallery,
    ProjectParticipants,
    ProjectCreatorCard,
    ProjectTechsCard,
    ProjectLinksCard,
    ProjectJoinForm,
    ProjectChat,
    ProjectStatusManager,
    ProjectDeleteDialog,
} from '@/components/projects/show';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    project: ProjectType & {
        creator: User;
        techs: Tech[];
        participants: User[];
        messages?: Message[];
    };
}

export default function Show({ auth, project }: Props) {
    const isCreator = auth.user?.id === project.user_id;

    return (
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
                            <ProjectDeleteDialog
                                projectSlug={project.slug}
                                projectTitle={project.title}
                                onDeleted={() => {}}
                            />
                        </div>
                    )}
                </div>
            }
        >
            <Seo title={project.title} description={project.description?.slice(0, 160)} />
            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <ProjectHero
                        title={project.title}
                        status={project.status}
                        images={project.images}
                        creatorName={project.creator.name}
                    />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="flex flex-col gap-6 lg:col-span-2">
                            <ProjectDescription description={project.description} />
                            <ProjectVision vision={project.vision} />
                            <ProjectGallery images={project.images ?? []} title={project.title} />
                            <ProjectParticipants participants={project.participants ?? []} />
                            <ProjectChat
                                projectId={project.id}
                                projectSlug={project.slug}
                                currentUserId={auth.user?.id}
                                messages={project.messages}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            <ProjectCreatorCard creator={project.creator} />
                            {isCreator && (
                                <ProjectStatusManager
                                    projectSlug={project.slug}
                                    currentStatus={project.status}
                                />
                            )}
                            <ProjectTechsCard techs={project.techs ?? []} />
                            <ProjectLinksCard
                                repository_url={project.repository_url}
                                demo_url={project.demo_url}
                            />
                            <ProjectJoinForm
                                projectId={project.id}
                                isOpen={project.status === 'open'}
                                isCreator={isCreator}
                                user={auth.user}
                                viewerJoinRequest={project.viewerJoinRequest}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
