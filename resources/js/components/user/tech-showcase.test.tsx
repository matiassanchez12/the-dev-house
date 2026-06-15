import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TechShowcase } from './tech-showcase';

const baseTech = {
    id: 1,
    name: 'React',
    slug: 'react',
    years: 2,
    proficiency: 'intermediate' as const,
};

describe('TechShowcase', () => {
    it('renders empty for no techs', () => {
        const { container } = render(<TechShowcase techs={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders techs with intermediate proficiency', () => {
        render(
            <TechShowcase
                techs={[
                    { ...baseTech, proficiency: 'intermediate' },
                ]}
            />,
        );

        expect(screen.getByText('Intermedio')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('renders techs with all proficiency levels', () => {
        render(
            <TechShowcase
                techs={[
                    { id: 1, name: 'Basic', slug: 'basic', years: 0, proficiency: 'basic' },
                    { id: 2, name: 'Intermediate', slug: 'intermediate', years: 2, proficiency: 'intermediate' },
                    { id: 3, name: 'Advanced', slug: 'advanced', years: 4, proficiency: 'advanced' },
                    { id: 4, name: 'Expert', slug: 'expert', years: 6, proficiency: 'expert' },
                    { id: 5, name: 'Master', slug: 'master', years: 8, proficiency: 'master' },
                ]}
            />,
        );

        expect(screen.getByText('Principiante')).toBeInTheDocument();
        expect(screen.getByText('Intermedio')).toBeInTheDocument();
        expect(screen.getByText('Avanzado')).toBeInTheDocument();
        expect(screen.getByText('Experto')).toBeInTheDocument();
    });

    it('applies proficiency badge color classes', () => {
        render(
            <TechShowcase
                techs={[
                    { id: 1, name: 'Basic', slug: 'basic', years: 0, proficiency: 'basic' },
                    { id: 2, name: 'Intermediate', slug: 'intermediate', years: 2, proficiency: 'intermediate' },
                    { id: 3, name: 'Advanced', slug: 'advanced', years: 4, proficiency: 'advanced' },
                    { id: 4, name: 'Expert', slug: 'expert', years: 6, proficiency: 'expert' },
                ]}
            />,
        );

        const getBadge = (name: string) => screen.getAllByText(name, { exact: false }).find((element) => element.getAttribute('data-slot') === 'badge');

        expect(getBadge('Basic')).toHaveClass('bg-muted', 'text-foreground');
        expect(getBadge('Intermediate')).toHaveClass('bg-blue-100', 'text-blue-800');
        expect(getBadge('Advanced')).toHaveClass('bg-green-100', 'text-green-800');
        expect(getBadge('Expert')).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('groups techs by proficiency level', () => {
        render(
            <TechShowcase
                techs={[
                    { id: 1, name: 'React', slug: 'react', years: 5, proficiency: 'expert' },
                    { id: 2, name: 'Vue', slug: 'vue', years: 5, proficiency: 'expert' },
                    { id: 3, name: 'Laravel', slug: 'laravel', years: 2, proficiency: 'intermediate' },
                ]}
            />,
        );

        // Expert group should contain both React and Vue
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Vue')).toBeInTheDocument();
        expect(screen.getByText('Laravel')).toBeInTheDocument();
    });

    it('falls back to years-based grouping when proficiency is null', () => {
        render(
            <TechShowcase
                techs={[
                    { id: 1, name: 'Rust', slug: 'rust', years: 7, proficiency: null },
                ]}
            />,
        );

        expect(screen.getByText('Experto')).toBeInTheDocument();
        expect(screen.getByText('Rust')).toBeInTheDocument();
    });
});
