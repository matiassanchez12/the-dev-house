import Seo from '@/components/seo';
import { FolderOpen, Users, Wrench } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { UserProfile } from '@/types';
import { UserProfileHeader } from '@/components/user/user-profile-header';
import { ProjectShowcase } from '@/components/user/project-showcase';
import { TechShowcase } from '@/components/user/tech-showcase';
import { cn } from '@/lib/utils';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    user: UserProfile;
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
        </div>
    );
}

export default function Show({ auth, user }: Props) {
    const hasProjects = user.createdProjects.length > 0 || user.participatingProjects.length > 0;
    const hasTechs = user.techs.length > 0;

    const stats = [
        { label: 'Proyectos creados', value: user.createdProjects.length, icon: <FolderOpen className="size-5" /> },
        { label: 'Proyectos participando', value: user.participatingProjects.length, icon: <Users className="size-5" /> },
        { label: 'Tecnologías', value: user.techs.length, icon: <Wrench className="size-5" /> },
    ];

    return (
        <>
            <Seo title={user.name} description={user.bio ? user.bio.slice(0, 160) : `Perfil de ${user.name} en The Dev House`} />
            <AppLayout>
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-muted/50 to-background">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                        <UserProfileHeader user={user} />
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Stats Row */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {stats.map((stat) => (
                            <StatItem key={stat.label} {...stat} />
                        ))}
                    </div>

                    <Separator className="my-8" />

                    {/* Tech Showcase */}
                    {hasTechs ? (
                        <Card>
                            <CardContent className="pt-6">
                                <TechShowcase techs={user.techs} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Empty className="mb-8 py-8">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Wrench className="size-5 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyTitle>Sin tecnologías</EmptyTitle>
                                <EmptyDescription>
                                    Este usuario aún no ha agregado tecnologías a su perfil.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    <Separator className="my-8" />

                    {/* Project Showcase */}
                    {hasProjects ? (
                        <Card>
                            <CardContent className="pt-6">
                                <ProjectShowcase
                                    createdProjects={user.createdProjects}
                                    participatingProjects={user.participatingProjects}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Empty className="py-8">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FolderOpen className="size-5 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyTitle>Sin proyectos</EmptyTitle>
                                <EmptyDescription>
                                    Este usuario aún no ha creado ni participado en proyectos.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
