import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectPhasesSection } from './project-phases-section';

const formMock = { data: { title: '', description: '', completed_at: '' }, setData: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), processing: false, errors: {}, reset: vi.fn() };

vi.mock('@inertiajs/react', () => ({ useForm: vi.fn(() => formMock) }));

describe('ProjectPhasesSection', () => {
    it('renders the empty state and opens creator form in drawer', () => {
        render(<ProjectPhasesSection projectSlug="awesome-project" phases={[]} viewerRole="creator" />);
        expect(screen.getByText('Logros')).toBeInTheDocument();
        expect(screen.getByText('Todavía no registraste logros')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Registrar logro' })).toBeInTheDocument();
    });

    it('renders phases and hides creator controls for members', () => {
        render(<ProjectPhasesSection projectSlug="awesome-project" viewerRole="member" phases={[{ id: 1, project_id: 1, title: 'Discovery', description: 'Validated the idea', completed_at: '2026-06-06T00:00:00.000Z', created_at: '2026-06-06T00:00:00.000Z', updated_at: '2026-06-06T00:00:00.000Z' }]} />);
        expect(screen.getByText('Discovery')).toBeInTheDocument();
        expect(screen.getByText('Validated the idea')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    });

    it('shows creator actions when the user owns the project', () => {
        render(<ProjectPhasesSection projectSlug="awesome-project" viewerRole="creator" phases={[{ id: 2, project_id: 1, title: 'Delivery', description: 'Shipped the MVP', completed_at: null, created_at: '2026-06-06T00:00:00.000Z', updated_at: '2026-06-06T00:00:00.000Z' }]} />);
        expect(screen.getByRole('button', { name: 'Registrar logro' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });
});
