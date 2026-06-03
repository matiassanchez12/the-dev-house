import Seo from '@/components/seo';
import AppLayout from '@/layouts/app-layout';
import DeleteUserForm from './partials/delete-user-form';
import UpdatePasswordForm from './partials/update-password-form';
import UpdateProfileInformationForm from './partials/update-profile-information-form';
import UpdateProfileCompleteForm from './partials/update-profile-complete-form';
import SocialLinksEditForm from './partials/social-links-edit-form';
import { SocialLink } from '@/types';

import { usePage } from '@inertiajs/react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    name: string;
    email: string;
    emailVerifiedAt: string | null;
    userTechs: unknown[];
    socialLinks?: SocialLink[];
}

export default function Edit({ mustVerifyEmail, status, name, email, emailVerifiedAt, userTechs, socialLinks }: Props) {
    const { techs } = usePage().props as { techs: unknown[] };
    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">
                    Mi Perfil
                </h2>
            }
        >
            <Seo title="Mi Perfil" description="Configurá tu perfil en The Dev House: actualizá tu información personal, tecnologías, redes sociales y contraseña." />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Información básica */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            name={name}
                            email={email}
                            emailVerifiedAt={emailVerifiedAt}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Perfil completo: bio, avatar, techs */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileCompleteForm
                            userTechs={userTechs}
                            allTechs={techs}
                            className="max-w-3xl"
                        />
                    </div>

                    {/* Redes sociales */}
                    {socialLinks !== undefined && (
                        <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                            <SocialLinksEditForm
                                socialLinks={socialLinks}
                                className="max-w-xl"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* Delete Account */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
