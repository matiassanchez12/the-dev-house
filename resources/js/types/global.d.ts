import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

declare global {
    const route: typeof import('ziggy-js').route;
    interface Window {
        Echo: Echo;
        Pusher: Pusher;
    }
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
