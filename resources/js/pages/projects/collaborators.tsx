import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CollaboratorSuggestionCard from '@/components/projects/collaborator-suggestion-card';
import type { CollaboratorSuggestion, Project, ProjectInvitation } from '@/types';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    project: Project;
    suggestions: CollaboratorSuggestion[];
    pendingInvitations: ProjectInvitation[];
}

export default function Collaborators({ project, suggestions, pendingInvitations }: Props) {
    const pendingSuggestions: CollaboratorSuggestion[] = pendingInvitations.map((invitation) => ({
        user: invitation.invitedUser ?? invitation.invited_user ?? {
            id: invitation.invited_user_id,
            name: 'Unknown user',
            email: '',
            created_at: invitation.created_at,
            updated_at: invitation.updated_at,
        },
        matching_techs: invitation.invitedUser?.techs ?? invitation.invited_user?.techs ?? [],
        pending_invitation: invitation,
    }));

    return (
        <>
            <Seo title={`${project.title} · Collaborators`} description="Invite relevant collaborators after creating your project." />
            <AppLayout
                header={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-semibold text-xl text-foreground leading-tight">
                            Find collaborators
                        </h2>
                        <Link href={route('projects.show', project.slug)}>
                            <Button variant="outline">Skip for now</Button>
                        </Link>
                    </div>
                }
            >
                <div className="py-10">
                    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Suggested collaborators</CardTitle>
                                <CardDescription>
                                    These users share at least one tech with your project.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {suggestions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No matching collaborators were found.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {suggestions.map((suggestion) => (
                                            <CollaboratorSuggestionCard
                                                key={suggestion.user.id}
                                                projectSlug={project.slug}
                                                suggestion={suggestion}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pending invitations</CardTitle>
                                <CardDescription>
                                    Review invitations that are waiting for a response.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingSuggestions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        You have not sent any invitations yet.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {pendingSuggestions.map((suggestion) => (
                                            <CollaboratorSuggestionCard
                                                key={suggestion.pending_invitation?.id ?? suggestion.user.id}
                                                projectSlug={project.slug}
                                                suggestion={suggestion}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
