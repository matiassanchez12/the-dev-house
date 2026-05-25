import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';

declare global {
    const route: typeof import('ziggy-js').route;
}

declare module 'axios' {
    interface AxiosInstance {
        defaults: {
            headers: {
                common: {
                    'X-Requested-With': string;
                    [key: string]: string;
                };
            };
        };
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps {
        flash: {
            success?: string;
            error?: string;
            warning?: string;
            info?: string;
        };
        errors: {
            [key: string]: string;
        };
    }
}
