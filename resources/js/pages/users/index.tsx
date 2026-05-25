import { Head } from '@inertiajs/react';
import { User, Tech } from '@/types';

interface Props {
    users: {
        data: User[];
        links: any;
        meta: any;
    };
    techs: Tech[];
    filters: {
        q?: string;
        tech?: string;
    };
}

// Minimal stub - full implementation in PR #2
export default function Index({ users, techs, filters }: Props) {
    return (
        <>
            <Head title="Discover Users" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Discover Users</h1>
                    <p>User discovery page - full implementation in PR #2</p>
                    <p>Users count: {users.data.length}</p>
                </div>
            </div>
        </>
    );
}
