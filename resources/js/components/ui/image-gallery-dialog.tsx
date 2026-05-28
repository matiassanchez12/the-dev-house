import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogOverlay,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
            {/* Fullscreen overlay */}
            <DialogOverlay className="fixed inset-0 bg-black/90" />
            
            {/* Centered dialog with margin auto */}
            <DialogContent
                showCloseButton={false}
                className="border-0 bg-transparent shadow-none p-0 max-w-none !left-0 !right-0 !mx-auto"
            >
                {/* Image container */}
                <div className="relative flex items-center justify-center">
                    {/* Main image - responsive max sizing, 800px max on desktop */}
                    <img
                        src={images[currentIndex]}
                        alt=""
                        className="max-h-[70vh] max-w-[85vw] sm:max-h-[80vh] sm:max-w-[90vw] md:max-h-[85vh] md:max-w-[700px] lg:max-h-[85vh] lg:max-w-[800px] xl:max-w-[800px] object-contain"
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
                                className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 sm:p-3 text-white hover:bg-black/70 transition-colors"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="size-6 sm:size-8" />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentIndex((i) => (i + 1) % images.length)
                                }
                                className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 sm:p-3 text-white hover:bg-black/70 transition-colors"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="size-6 sm:size-8" />
                            </button>
                        </>
                    )}

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute -top-3 -right-3 sm:top-2 sm:right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors z-10"
                        aria-label="Cerrar"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="sm:w-5 sm:h-5"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>

                    {/* Index indicator */}
                    <div className="absolute -bottom-8 sm:bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs sm:text-sm text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}