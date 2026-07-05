import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPortal } from 'react-dom';
import { APP_URL } from '@/lib/seo';
import Seo from './seo';

vi.mock('@inertiajs/react', () => ({
    Head: ({ children, title }: { children: ReactNode; title?: string }) => {
        document.title = title ? `${title} - The Dev House` : 'The Dev House';

        return createPortal(<>{children}</>, document.head);
    },
}));

describe('Seo', () => {
    afterEach(() => {
        document.title = 'The Dev House';
    });

    it('publishes the page title and metadata into the document head', () => {
        render(<Seo title="Dashboard" />);
        const expectedBase = APP_URL || window.location.origin;

        expect(document.title).toBe('Dashboard - The Dev House');
        expect(document.head.querySelector('meta[name="title"]')?.getAttribute('content')).toBe('Dashboard - The Dev House');
        expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
            'The Dev House — Una plataforma colaborativa para desarrolladores. Crea proyectos, únete a equipos y construye software juntos.',
        );
        expect(document.head.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Dashboard - The Dev House');
        expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Dashboard - The Dev House');
        expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(`${expectedBase}/og.jpg`);
        expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(`${expectedBase}/`);
    });
});
