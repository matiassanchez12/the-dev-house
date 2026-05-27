import { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImageGalleryDialogProps } from '@/types';

export function ImageGalleryDialog({
    images,
    open,
    initialIndex,
    onOpenChange,
}: ImageGalleryDialogProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset currentIndex when dialog opens
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!open || images.length <= 1) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentIndex((i) => (i - 1 + images.length) % images.length);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentIndex((i) => (i + 1) % images.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, images.length]);

    if (images.length === 0) return null;

    const showNav = images.length > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90" />
            <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Close button */}
                <Dialog.Close
                    render={
                        <button
                            type="button"
                            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                        />
                    }
                >
                    <X className="size-5" />
                    <span className="sr-only">Cerrar</span>
                </Dialog.Close>

                {/* Main image container */}
                <div className="relative flex items-center justify-center px-16 py-8">
                    <img
                        src={images[currentIndex]}
                        alt=""
                        className="max-h-[80vh] max-w-[calc(100vw-8rem)] object-contain rounded-lg"
                    />

                    {/* Navigation buttons */}
                    {showNav && (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentIndex(
                                        (i) => (i - 1 + images.length) % images.length
                                    )
                                }
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentIndex(
                                        (i) => (i + 1) % images.length
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="size-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Index indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
                    {currentIndex + 1} / {images.length}
                </div>
            </Dialog.Popup>
        </Dialog>
    );
}
