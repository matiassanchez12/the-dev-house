import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuestFollows } from './use-guest-follows';

describe('useGuestFollows', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('persists guest follows, seen state, and unread detection', () => {
        const { result } = renderHook(() => useGuestFollows());

        act(() => {
            result.current.follow(1, 'alpha');
        });

        expect(JSON.parse(localStorage.getItem('devcollab:guest-follows:v1') ?? '[]')).toEqual([
            expect.objectContaining({ projectId: 1, slug: 'alpha' }),
        ]);
        expect(result.current.isFollowing(1)).toBe(true);

        act(() => {
            result.current.markSeen(1);
        });

        const seenAt = localStorage.getItem('devcollab:guest-seen:v1:1');

        expect(seenAt).not.toBeNull();
        expect(result.current.hasUnread(1, new Date(Date.now() + 60_000).toISOString())).toBe(true);
        expect(result.current.hasUnread(1, new Date(Date.now() - 60_000).toISOString())).toBe(false);

        act(() => {
            result.current.unfollow(1);
        });

        expect(result.current.isFollowing(1)).toBe(false);
        expect(localStorage.getItem('devcollab:guest-follows:v1')).toBe('[]');
        expect(localStorage.getItem('devcollab:guest-seen:v1:1')).toBeNull();
    });

    it('ignores storage write failures without throwing', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded');
        });

        const { result } = renderHook(() => useGuestFollows());

        expect(() => {
            act(() => {
                result.current.follow(2, 'beta');
                result.current.markSeen(2);
            });
        }).not.toThrow();

        setItemSpy.mockRestore();
    });
});
