import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Button } from './button';

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
            {/* Centered dialog with margin auto */}
            <DialogContent
                showCloseButton={false}
            >
                <DialogHeader className="flex flex-row justify-end items-center py-2 px-4">
                    <DialogTitle className="sr-only">Image Gallery</DialogTitle>
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute -top-3 -right-3 sm:top-2 sm:right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors z-20"
                        size="icon"
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
                    </Button>
                </DialogHeader>
                <GalleryCarousel
                    images={images}
                    currentIndex={currentIndex}
                    onSlideChange={setCurrentIndex}
                />
                <DialogFooter className="bg-transparent shadow-none border-0">
                    <div className="rounded-full px-3 py-1 text-xs sm:text-sm text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


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
        const onSelect = () => {
            onSlideChange(api.selectedScrollSnap());
        };

        api.on('select', onSelect);

        // Cleanup
        return () => {
            api.off('select', onSelect);
        };
    }, [api, currentIndex, onSlideChange]);

    return (
        <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'center' }}
            className="w-1/2 h-1/2"
        >
            <CarouselContent>
                {images.map((src, index) => (
                    <CarouselItem key={index} className="p-0">
                        <Card className="m-0 border-0 bg-transparent shadow-none">
                            <CardContent className="flex items-center justify-center p-0 h-full w-full">
                                <img
                                    src={src}
                                    alt=""
                                    className="max-h-full w-full object-contain"
                                />
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious
                className="left-2 sm:left-4 bg-black/50 text-white hover:bg-black/70 border-0 z-20"
                size="icon"
            />
            <CarouselNext
                className="right-2 sm:right-4 bg-black/50 text-white hover:bg-black/70 border-0 z-20"
                size="icon"
            />
        </Carousel>
    );
}