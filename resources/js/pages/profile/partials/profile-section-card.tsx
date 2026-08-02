import { type ReactNode } from 'react'

interface ProfileSectionCardProps {
    children: ReactNode
}

export default function ProfileSectionCard({ children }: ProfileSectionCardProps) {
    return <div className="bg-card p-4 shadow sm:rounded-lg sm:p-8">{children}</div>
}
