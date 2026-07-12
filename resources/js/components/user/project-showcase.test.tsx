import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getProjectShowcaseEmptyState, ProjectShowcase } from './project-showcase'

describe('getProjectShowcaseEmptyState', () => {
    it('returns the normal empty state copy when activity is visible', () => {
        expect(getProjectShowcaseEmptyState(true)).toMatchObject({
            title: 'No hay proyectos para mostrar',
            description: 'Los proyectos aparecerán aquí cuando estén disponibles.',
        })
    })

    it('returns the privacy empty state copy when activity is hidden', () => {
        expect(getProjectShowcaseEmptyState(false)).toMatchObject({
            title: 'Actividad oculta',
            description: 'Este perfil mantiene su actividad privada.',
        })
    })
})

describe('ProjectShowcase', () => {
    it('renders the normal empty state when activity is visible and no projects exist', () => {
        render(<ProjectShowcase createdProjects={[]} participatingProjects={[]} />)

        expect(screen.getByText('No hay proyectos para mostrar')).toBeInTheDocument()
        expect(screen.queryByText('Actividad oculta')).not.toBeInTheDocument()
    })

    it('renders the privacy empty state when activity is hidden and no projects exist', () => {
        render(
            <ProjectShowcase
                createdProjects={[]}
                participatingProjects={[]}
                showActivity={false}
            />,
        )

        expect(screen.getByText('Actividad oculta')).toBeInTheDocument()
        expect(screen.getByText('Este perfil mantiene su actividad privada.')).toBeInTheDocument()
    })
})
