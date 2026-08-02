import Seo from '@/components/seo'
import AppLayout from '@/layouts/app-layout'
import DeleteUserForm from './partials/delete-user-form'
import ProfileSectionCard from './partials/profile-section-card'
import ProfileSection from './partials/profile-section'
import SocialLinksEditForm from './partials/social-links-edit-form'
import UpdateNotificationSettingsForm from './partials/update-notification-settings-form'
import UpdatePasswordForm from './partials/update-password-form'
import UpdatePrivacyForm from './partials/update-privacy-form'
import UpdateProfileCompleteForm from './partials/update-profile-complete-form'
import UpdateProfileInformationForm from './partials/update-profile-information-form'
import { NotificationSetting, PrivacySetting, SharedPageProps, SocialLink, Tech } from '@/types'
import { type TechProficiency } from '@/lib/tech-proficiency'

import { usePage } from '@inertiajs/react'

interface UserTech extends Omit<Tech, 'pivot'> {
    pivot: {
        years_experience: number | null
        proficiency: TechProficiency | null
    }
}

interface Props {
    mustVerifyEmail: boolean
    status?: string
    name: string
    email: string
    emailVerifiedAt: string | null
    userTechs: UserTech[]
    phone: string | null
    privacySetting: PrivacySetting
    notificationSetting: NotificationSetting
    socialLinks?: SocialLink[]
}

export default function Edit({
    mustVerifyEmail,
    status,
    name,
    email,
    emailVerifiedAt,
    userTechs,
    phone,
    privacySetting,
    notificationSetting,
    socialLinks,
}: Props) {
    const { techs } = usePage<SharedPageProps & { techs: Tech[] }>().props

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">Mi Perfil</h2>
            }
        >
            <Seo
                title="Mi Perfil"
                description="Configurá tu perfil en The Dev House: actualizá tu información personal, tecnologías, redes sociales y contraseña."
            />

            <div className="py-12">
                <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:px-6 lg:px-8">
                    <ProfileSection title="Perfil público">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            name={name}
                            email={email}
                            emailVerifiedAt={emailVerifiedAt}
                            className="max-w-xl"
                        />

                        <ProfileSectionCard>
                            <UpdateProfileCompleteForm
                                userTechs={userTechs}
                                allTechs={techs}
                                className="max-w-3xl"
                            />
                        </ProfileSectionCard>

                        {socialLinks !== undefined ? (
                            <ProfileSectionCard>
                                <SocialLinksEditForm
                                    socialLinks={socialLinks}
                                    className="max-w-xl"
                                />
                            </ProfileSectionCard>
                        ) : null}
                    </ProfileSection>

                    <ProfileSection title="Cuenta y seguridad">
                        <UpdatePasswordForm className="max-w-xl" />
                    </ProfileSection>

                    <ProfileSection title="Privacidad y notificaciones">
                        <ProfileSectionCard>
                            <UpdatePrivacyForm
                                phone={phone}
                                privacySetting={privacySetting}
                                className="max-w-xl"
                            />
                        </ProfileSectionCard>

                        <ProfileSectionCard>
                            <UpdateNotificationSettingsForm
                                notificationSetting={notificationSetting}
                                className="max-w-xl"
                            />
                        </ProfileSectionCard>
                    </ProfileSection>

                    <ProfileSection title="Zona de peligro">
                        <DeleteUserForm className="max-w-xl" />
                    </ProfileSection>
                </div>
            </div>
        </AppLayout>
    )
}
