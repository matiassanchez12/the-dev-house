import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Laravel Echo y Reverb para WebSockets
 * Descomentá esto cuando necesites usar chat/notificaciones en tiempo real
 */
// import Echo from 'laravel-echo';
//
// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT,
//     wssPort: import.meta.env.VITE_REVERB_PORT,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });
