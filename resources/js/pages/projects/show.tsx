import { useMemo } from 'react';
import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Message, Phase, Project as ProjectType, Tech, User } from '@/types';
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
    ProjectChatSummary,
    ProjectPhasesSection,
    ProjectStatusManager,
    ProjectDeleteDialog,
    ProjectInvitationResponseCard,
} from '@/components/projects/show';

type ViewerJoinRequest = ProjectType['viewerJoinRequest'];

interface Props {
    auth: {
        user: User | null;
    };
    project: ProjectType & {
        viewer_role?: 'guest' | 'creator' | 'member';
        creator: User;
        techs: Tech[];
        participants: User[];
        messages?: Message[];
        phases?: Phase[];
        messages_count?: number;
        viewerJoinRequest?: ViewerJoinRequest;
    };
}

export default function Show({ auth, project }: Props) {
    const viewerRole = project.viewer_role ?? 'guest';
    const isCreator = viewerRole === 'creator';
    const isParticipant = useMemo(
        () => project.participants?.some((p) => p.id === auth.user?.id) ?? false,
        [project.participants, auth.user?.id],
    );
    const viewerPendingInvitation = project.viewerPendingInvitation ?? null;

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="min-w-0 break-words text-lg font-semibold leading-tight text-foreground sm:text-xl">
                        {project.title}
                    </h2>
                    {isCreator && (
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                            <Link href={route('projects.collaborators', project.slug)} className="flex-1 sm:flex-none">
                                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                                    <Users className="size-4" />
                                    Colaboradores
                                </Button>
                            </Link>
                            <Link href={route('projects.edit', project.slug)} className="flex-1 sm:flex-none">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">Editar</Button>
                            </Link>
                            <div className="flex-1 sm:flex-none [&>button]:w-full sm:[&>button]:w-auto">
                                <ProjectDeleteDialog
                                    projectSlug={project.slug}
                                    projectTitle={project.title}
                                    onDeleted={() => {}}
                                />
                            </div>
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
                            <ProjectPhasesSection
                                projectSlug={project.slug}
                                phases={project.phases}
                                viewerRole={viewerRole}
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
                            {viewerPendingInvitation && (
                                <ProjectInvitationResponseCard
                                    invitationId={viewerPendingInvitation.id}
                                    message={viewerPendingInvitation.message}
                                />
                            )}
                            <ProjectJoinForm
                                projectId={project.id}
                                isOpen={project.status === 'open' || project.status === 'in_progress'}
                                isCreator={isCreator}
                                isParticipant={isParticipant}
                                user={auth.user}
                                viewerJoinRequest={project.viewerJoinRequest}
                            />
                            {(isParticipant || isCreator) && (
                            <ProjectChatSummary
                                projectSlug={project.slug}
                                messagesCount={project.messages_count}
                                messages={project.messages}
                            />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
