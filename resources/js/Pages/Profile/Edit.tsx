import AuthenticatedLayout from '@/Layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/delete-user-form';
import UpdatePasswordForm from './Partials/update-password-form';
import UpdateProfileInformationForm from './Partials/update-profile-information-form';
import UpdateProfileCompleteForm from './Partials/update-profile-complete-form';

export default function Edit({ mustVerifyEmail, status, userTechs, allTechs }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">
                    Mi Perfil
                </h2>
            }
        >
            <Head title="Mi Perfil" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Información básica */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Perfil completo: bio, avatar, techs */}
                    <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileCompleteForm
                            userTechs={userTechs}
                            allTechs={allTechs}
                            className="max-w-3xl"
                        />
                    </div>

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
        </AuthenticatedLayout>
    );
}
