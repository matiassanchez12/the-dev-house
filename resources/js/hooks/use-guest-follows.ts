import { useCallback, useState } from 'react';

export interface GuestFollowRecord {
    projectId: number;
    slug: string;
    followedAt: string;
}

interface GuestState {
    follows: GuestFollowRecord[];
    seen: Record<number, string>;
}

const FOLLOW_KEY = 'devcollab:guest-follows:v1';
const SEEN_PREFIX = 'devcollab:guest-seen:v1:';

function readJson<T>(value: string | null, fallback: T): T {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function readState(): GuestState {
    if (typeof window === 'undefined') {
        return { follows: [], seen: {} };
    }

    try {
        const follows = readJson<GuestFollowRecord[]>(localStorage.getItem(FOLLOW_KEY), []);
        const seen: Record<number, string> = {};

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);

            if (!key || !key.startsWith(SEEN_PREFIX)) {
                continue;
            }

            const projectId = Number.parseInt(key.slice(SEEN_PREFIX.length), 10);
            const seenAt = localStorage.getItem(key);

            if (!Number.isNaN(projectId) && seenAt) {
                seen[projectId] = seenAt;
            }
        }

        return { follows, seen };
    } catch {
        return { follows: [], seen: {} };
    }
}

function saveFollows(follows: GuestFollowRecord[]): void {
    try {
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(follows));
    } catch {
        // Storage may be unavailable or full.
    }
}

function saveSeen(projectId: number, seenAt: string): void {
    try {
        localStorage.setItem(`${SEEN_PREFIX}${projectId}`, seenAt);
    } catch {
        // Storage may be unavailable or full.
    }
}

function removeSeen(projectId: number): void {
    try {
        localStorage.removeItem(`${SEEN_PREFIX}${projectId}`);
    } catch {
        // Storage may be unavailable or full.
    }
}

function isLaterThan(left: string | null | undefined, right: string | null | undefined): boolean {
    if (!left || !right) {
        return false;
    }

    return Date.parse(left) > Date.parse(right);
}

export function useGuestFollows() {
    const [state, setState] = useState<GuestState>(() => readState());

    const commit = useCallback((updater: (current: GuestState) => GuestState) => {
        setState((current) => {
            const next = updater(current);

            saveFollows(next.follows);

            for (const [projectId, seenAt] of Object.entries(next.seen)) {
                saveSeen(Number(projectId), seenAt);
            }

            return next;
        });
    }, []);

    const isFollowing = useCallback((projectId: number): boolean => {
        return state.follows.some((follow) => follow.projectId === projectId);
    }, [state.follows]);

    const follow = useCallback((projectId: number, slug: string): void => {
        commit((current) => {
            const existing = current.follows.find((follow) => follow.projectId === projectId);

            const seenAt = new Date().toISOString();
            const follows = existing
                ? current.follows.map((follow) => (
                    follow.projectId === projectId
                        ? { ...follow, slug, followedAt: seenAt }
                        : follow
                ))
                : [...current.follows, { projectId, slug, followedAt: seenAt }];

            return {
                follows,
                seen: {
                    ...current.seen,
                    [projectId]: seenAt,
                },
            };
        });
    }, [commit]);

    const unfollow = useCallback((projectId: number): void => {
        commit((current) => ({
            follows: current.follows.filter((follow) => follow.projectId !== projectId),
            seen: Object.fromEntries(
                Object.entries(current.seen).filter(([seenProjectId]) => Number(seenProjectId) !== projectId),
            ) as Record<number, string>,
        }));

        removeSeen(projectId);
    }, [commit]);

    const markSeen = useCallback((projectId: number): void => {
        if (!isFollowing(projectId)) {
            return;
        }

        const seenAt = new Date().toISOString();

        commit((current) => ({
            follows: current.follows,
            seen: {
                ...current.seen,
                [projectId]: seenAt,
            },
        }));
    }, [commit, isFollowing]);

    const hasUnread = useCallback((projectId: number, latestPhaseUpdatedAt?: string | null): boolean => {
        if (!isFollowing(projectId)) {
            return false;
        }

        const seenAt = state.seen[projectId];

        if (!seenAt) {
            return Boolean(latestPhaseUpdatedAt);
        }

        return isLaterThan(latestPhaseUpdatedAt, seenAt);
    }, [isFollowing, state.seen]);

    return {
        follow,
        hasUnread,
        isFollowing,
        markSeen,
        unfollow,
    };
}
