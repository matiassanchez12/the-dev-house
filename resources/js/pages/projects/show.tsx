import Seo from '@/components/seo';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { buttonVariants } from '@/components/ui/button';
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
    ProjectFollowCard,
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
        followers_count?: number;
        is_followed_by_viewer?: boolean;
        viewerJoinRequest?: ViewerJoinRequest;
    };
}

export default function Show({ auth, project }: Props) {
    const fallbackViewerRole = auth.user === null
        ? 'guest'
        : project.creator.id === auth.user.id || project.user_id === auth.user.id
            ? 'creator'
            : project.participants?.some((participant) => participant.id === auth.user.id)
                ? 'member'
                : 'guest';
    const viewerRole = project.viewer_role ?? fallbackViewerRole;
    const isCreator = viewerRole === 'creator';
    const isParticipant = viewerRole === 'member';
    const hasProjectAccess = isCreator || isParticipant;
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
                            <Link
                                href={route('projects.collaborators', project.slug)}
                                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'flex-1 w-full justify-center sm:flex-none sm:w-auto' })}
                            >
                                <Users className="size-4" />
                                Colaboradores
                            </Link>
                            <Link
                                href={route('projects.edit', project.slug)}
                                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'flex-1 w-full justify-center sm:flex-none sm:w-auto' })}
                            >
                                Editar
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
                        followSection={(
                            <ProjectFollowCard
                                projectSlug={project.slug}
                                followersCount={project.followers_count ?? 0}
                                followersPreview={project.followers_preview ?? []}
                                isAuthenticated={auth.user !== null}
                                isFollowing={project.is_followed_by_viewer ?? false}
                                readOnly={isCreator}
                            />
                        )}
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
                            {hasProjectAccess && (
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
