import { AxiosInstance } from 'axios';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

declare global {
    var route: typeof import('ziggy-js').route;
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
    interface PageProps {
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
