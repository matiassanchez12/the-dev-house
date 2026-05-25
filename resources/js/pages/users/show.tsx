import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/types';
import { UserProfileHeader } from '@/components/user/user-profile-header';
import { ProjectShowcase } from '@/components/user/project-showcase';
import { TechShowcase } from '@/components/user/tech-showcase';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    user: UserProfile;
}

export default function Show({ auth, user }: Props) {
    const hasProjects = user.createdProjects.length > 0 || user.participatingProjects.length > 0;
    const hasTechs = user.techs.length > 0;

    return (
        <>
            <Head title={user.name} />
            <PublicLayout
                header={
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        Perfil de {user.name}
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        {/* Profile Header */}
                        <Card>
                            <CardContent className="pt-6">
                                <UserProfileHeader user={user} />
                            </CardContent>
                        </Card>

                        {/* Tech Showcase */}
                        {hasTechs && (
                            <Card>
                                <CardContent className="pt-6">
                                    <TechShowcase techs={user.techs} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Showcase */}
                        {hasProjects && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Proyectos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ProjectShowcase
                                        createdProjects={user.createdProjects}
                                        participatingProjects={user.participatingProjects}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
