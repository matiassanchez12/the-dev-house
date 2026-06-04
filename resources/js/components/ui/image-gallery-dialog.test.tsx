import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImageGalleryDialog } from './image-gallery-dialog';

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: { children: ReactNode }) => <div data-testid="dialog">{children}</div>,
    DialogContent: ({
        children,
        className,
    }: {
        children: ReactNode;
        className?: string;
    }) => (
        <div data-testid="dialog-content" className={className}>
            {children}
        </div>
    ),
    DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogFooter: ({ children }: { children: ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
    DialogHeader: ({ children }: { children: ReactNode }) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/carousel', () => ({
    Carousel: ({
        children,
        className,
    }: {
        children: ReactNode;
        className?: string;
    }) => (
        <div data-testid="carousel" className={className}>
            {children}
        </div>
    ),
    CarouselContent: ({ children }: { children: ReactNode }) => <div data-testid="carousel-content">{children}</div>,
    CarouselItem: ({
        children,
        className,
    }: {
        children: ReactNode;
        className?: string;
    }) => (
        <div data-testid="carousel-item" className={className}>
            {children}
        </div>
    ),
    CarouselPrevious: () => <button type="button">Previous</button>,
    CarouselNext: () => <button type="button">Next</button>,
    useCarousel: () => ({ api: undefined }),
}));

describe('ImageGalleryDialog', () => {
    it('renders a wider dialog and a full-width carousel', () => {
        render(
            <ImageGalleryDialog
                images={['/one.jpg', '/two.jpg']}
                open
                initialIndex={0}
                onOpenChange={vi.fn()}
            />,
        );

        expect(screen.getByTestId('dialog-content')).toHaveClass('sm:max-w-5xl');
        expect(screen.getByTestId('dialog-content')).not.toHaveClass('sm:max-w-sm');
        expect(screen.getByTestId('carousel')).toHaveClass('w-full');
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('keeps the initial image index when opening', () => {
        render(
            <ImageGalleryDialog
                images={['/one.jpg', '/two.jpg', '/three.jpg']}
                open
                initialIndex={1}
                onOpenChange={vi.fn()}
            />,
        );

        expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('returns null when there are no images', () => {
        const { container } = render(
            <ImageGalleryDialog images={[]} open initialIndex={0} onOpenChange={vi.fn()} />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
