import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
} from '@/components/ui/dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    useCarousel,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import type { ImageGalleryDialogProps } from '@/types';

function GalleryCarousel({ images, currentIndex, onSlideChange }: {
    images: string[];
    currentIndex: number;
    onSlideChange: (index: number) => void;
}) {
    const [api, setApi] = useState<ReturnType<typeof useCarousel>['api']>(undefined);

    useEffect(() => {
        if (!api) return;

        // Sync external currentIndex with carousel
        if (api.selectedScrollSnap() !== currentIndex) {
            api.scrollTo(currentIndex);
        }

        // Listen to slide changes
        api.on('select', () => {
            onSlideChange(api.selectedScrollSnap());
        });
    }, [api, currentIndex, onSlideChange]);

    return (
        <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'center' }}
            className="w-[50vw] sm:w-[40vw] lg:w-[30vw] h-auto"
        >
            <CarouselContent>
                {images.map((src, index) => (
                    <CarouselItem key={index} className="p-0">
                        <Card className="m-0 border-0 bg-transparent shadow-none">
                            <CardContent className="flex aspect-square sm:aspect-auto sm:h-[70vh] md:h-[75vh] lg:h-[80vh] items-center justify-center p-0">
                                <img
                                    src={src}
                                    alt=""
                                    className="h-full w-full object-contain"
                                />
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious 
                className="-left-4 sm:-left-8 bg-black/50 text-white hover:bg-black/70 border-0 z-20"
                size="icon"
            />
            <CarouselNext 
                className="-right-4 sm:-right-8 bg-black/50 text-white hover:bg-black/70 border-0 z-20"
                size="icon"
            />
        </Carousel>
    );
}

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

    if (images.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Fullscreen overlay */}
            <DialogOverlay className="fixed inset-0 bg-black/90" />

            {/* Centered dialog with margin auto */}
            <DialogContent
                showCloseButton={false}
                className="border-0 shadow-none bg-transparent border-none ring-0 w-full p-0 !left-0 !right-0 !mx-auto"
            >
                <DialogHeader className="flex flex-row justify-end items-center py-2 px-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute -top-3 -right-3 sm:top-2 sm:right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors z-20"
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
                </DialogHeader>
                <DialogDescription>
                    <GalleryCarousel
                        images={images}
                        currentIndex={currentIndex}
                        onSlideChange={setCurrentIndex}
                    />
                </DialogDescription>
                <DialogFooter className="bg-transparent shadow-none border-0">
                    <div className="rounded-full px-3 py-1 text-xs sm:text-sm text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}