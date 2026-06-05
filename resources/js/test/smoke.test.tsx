import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Test infrastructure', () => {
    it('renders a React component and finds text via RTL', () => {
        render(<div>Hello from tests</div>);
        expect(screen.getByText('Hello from tests')).toBeInTheDocument();
    });

    it('loads jest-dom extended matchers', () => {
        render(
            <button type="button" disabled>
                Click me
            </button>,
        );
        const button = screen.getByRole('button', { name: 'Click me' });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
