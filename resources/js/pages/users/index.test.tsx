import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersIndex from './index';

const mockState = vi.hoisted(() => ({
    routerGetMock: vi.fn(),
    selectOnValueChange: undefined as ((value: string) => void) | undefined,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
    router: {
        get: mockState.routerGetMock,
    },
}));

vi.mock('@/components/seo', () => ({
    default: () => null,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/user/user-card', () => ({
    UserCard: ({ user }: { user: { name: string } }) => <div>{user.name}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, variant: _variant, size: _size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => (
        <button {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/empty', () => ({
    Empty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    EmptyHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    EmptyMedia: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    EmptyTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    EmptyDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/pagination', () => ({
    Pagination: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
    PaginationContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    PaginationItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
    Separator: () => <hr />,
}));

vi.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange }: { children: ReactNode; onValueChange: (value: string) => void }) => {
        mockState.selectOnValueChange = onValueChange;
        return <div>{children}</div>;
    },
    SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
        <button type="button" onClick={() => mockState.selectOnValueChange?.(value)}>
            {children}
        </button>
    ),
    SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));

vi.mock('lucide-react', () => ({
    Search: () => <span />,
    SlidersHorizontal: () => <span />,
    X: () => <span />,
}));

describe('UsersIndex', () => {
    beforeEach(() => {
        mockState.routerGetMock.mockClear();
        mockState.selectOnValueChange = undefined;
    });

    it('filters users by name when pressing Enter', async () => {
        const user = userEvent.setup();

        render(<UsersIndex {...buildProps()} />);

        await user.type(screen.getByPlaceholderText('Nombre del developer...'), 'Ada{enter}');

        expect(mockState.routerGetMock).toHaveBeenCalledWith(
            '/users',
            { q: 'Ada', tech: null },
            { preserveState: true, preserveScroll: true },
        );
    });

    it('waits for the selected tech before refetching', async () => {
        const user = userEvent.setup();

        render(<UsersIndex {...buildProps()} />);

        expect(mockState.routerGetMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'React' }));

        expect(mockState.routerGetMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Filtrar' }));

        expect(mockState.routerGetMock).toHaveBeenCalledWith(
            '/users',
            { q: null, tech: 'react' },
            { preserveState: true, preserveScroll: true },
        );
    });

    it('paginates using the last applied filters, not draft inputs', async () => {
        const user = userEvent.setup();

        render(<UsersIndex {...buildProps({
            filters: {
                q: 'Ada',
                tech: 'react',
            },
            users: {
                data: [
                    {
                        id: 1,
                        name: 'Ada Lovelace',
                        slug: 'ada-lovelace',
                        avatar: null,
                        bio: null,
                        techs: [],
                        created_projects_count: 2,
                        joined_projects_count: 1,
                    },
                ],
                links: [
                    { url: null, label: '&laquo; Previous', active: false },
                    { url: '/users?page=2', label: '2', active: false },
                    { url: '/users?page=2', label: 'Next &raquo;', active: false },
                ],
                meta: {
                    total: 20,
                    last_page: 2,
                    per_page: 12,
                },
            },
        })} />);

        await user.clear(screen.getByPlaceholderText('Nombre del developer...'));
        await user.type(screen.getByPlaceholderText('Nombre del developer...'), 'Grace');
        await user.click(screen.getByRole('button', { name: 'React' }));
        mockState.routerGetMock.mockClear();

        await user.click(screen.getByRole('button', { name: '2' }));

        expect(mockState.routerGetMock).toHaveBeenCalledWith(
            '/users?page=2',
            { q: 'Ada', tech: 'react' },
        );
    });
});

function buildProps(overrides?: Partial<Parameters<typeof UsersIndex>[0]> & {
    users?: Partial<Parameters<typeof UsersIndex>[0]['users']>;
}): Parameters<typeof UsersIndex>[0] {
    const { users: userOverrides, ...restOverrides } = overrides ?? {};

    return {
        users: {
            data: [
                {
                    id: 1,
                    name: 'Ada Lovelace',
                    slug: 'ada-lovelace',
                    avatar: null,
                    bio: null,
                    techs: [],
                    created_projects_count: 2,
                    joined_projects_count: 1,
                },
            ],
            links: [],
            meta: {
                total: 1,
                last_page: 1,
                per_page: 12,
            },
            ...userOverrides,
        },
        techs: [
            {
                id: 1,
                name: 'React',
                slug: 'react',
                created_at: '2026-06-06T00:00:00.000Z',
                updated_at: '2026-06-06T00:00:00.000Z',
            },
        ],
        filters: {
            q: '',
            tech: '',
            ...overrides?.filters,
        },
        ...restOverrides,
    };
}
