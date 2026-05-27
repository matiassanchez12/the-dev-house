import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
    duration?: number;
    trigger?: boolean;
    decimals?: number;
}

/**
 * Animated count-up hook using requestAnimationFrame.
 * Returns 0 until trigger becomes true, then animates to target.
 */
export function useCountUp(
    target: number,
    { duration = 1500, trigger = true, decimals = 0 }: UseCountUpOptions = {},
): number {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!trigger) {
            setCount(0);
            return;
        }

        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic for smooth deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = easedProgress * target;

            setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [target, duration, trigger, decimals]);

    return count;
}
