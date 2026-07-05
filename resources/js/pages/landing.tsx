import Seo from '@/components/seo';
import { Project as ProjectType, LandingPageProps, User } from '@/types';
import LandingNav from '@/components/landing/landing-nav';
import LandingHero from '@/components/landing/landing-hero';
import LandingStats from '@/components/landing/landing-stats';
import LandingHowItWorks from '@/components/landing/landing-how-it-works';
import LandingManifesto from '@/components/landing/landing-manifesto';
import LandingFooter from '@/components/landing/landing-footer';
import LandingFeatures from '@/components/landing/landing-features';
import LandingProjects from '@/components/landing/landing-projects';
import LandingSocial from '@/components/landing/landing-social';

interface Props extends LandingPageProps {
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
    projects: {
        data: ProjectType[];
        total: number;
    };
    users: User[]
}

export default function Landing({ auth, projects, project_count, collaboration_count, users, techs }: Props) {
    return (
        <>
            <Seo title="Donde los desarrolladores construyen juntos" description="The Dev House es una plataforma colaborativa para desarrolladores. Creá proyectos, unite a equipos y construí software en comunidad." />
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <LandingNav auth={auth} />

                {/* Hero */}
                <LandingHero auth={auth} techs={techs} />

                {/* Stats
                <LandingStats
                    user_count={users.length}
                    project_count={project_count}
                    collaboration_count={collaboration_count}
                />
                */}

                {/* Manifesto */}
                <LandingManifesto />

                {/* How It Works */}
                <LandingHowItWorks />

                {/* Social Proof */}
                <LandingSocial developers={users} />

                {/* Featured Projects Section */}
                <LandingProjects projects={projects} auth={auth} />

                {/* Features Section */}
                <LandingFeatures />

                {/* Footer */}
                <LandingFooter />
            </div>
        </>
    );
}
