import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseInViewOnceOptions {
    rootMargin?: string;
    threshold?: number;
}

export function useInViewOnce<T extends Element = HTMLDivElement>(
    options: UseInViewOnceOptions = {},
): [RefObject<T>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                        return;
                    }
                }
            },
            {
                rootMargin: options.rootMargin ?? '0px',
                threshold: options.threshold ?? 0.1,
            },
        );

        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [options.rootMargin, options.threshold]);

    return [ref, inView];
}
