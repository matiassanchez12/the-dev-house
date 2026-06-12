import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Read XSRF token from cookies and set it as a header for CSRF protection
const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
if (xsrfToken) {
    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken.split('=')[1]);
}

const reverbConfig = window.__REVERB_CONFIG__;

console.log('[Reverb] Config:', reverbConfig);

if (reverbConfig?.key) {
    try {
        const Echo = (await import('laravel-echo')).default;
        const Pusher = (await import('pusher-js')).default;

        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: reverbConfig.key,
            wsHost: reverbConfig.host,
            wsPort: reverbConfig.port,
            wssPort: reverbConfig.port,
            forceTLS: reverbConfig.scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            authorizer: (channel) => ({
                authorize: (socketId, callback) => {
                    console.log('[Reverb] Authorizing channel:', channel.name);
                    window.axios.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    }).then((response) => {
                        console.log('[Reverb] Auth success:', response.data);
                        callback(null, response.data);
                    }).catch((error) => {
                        console.error('[Reverb] Auth error:', error.response?.data || error.message);
                        callback(error, null);
                    });
                },
            }),
        });

        console.log('[Reverb] Echo initialized successfully');
    } catch (error) {
        console.error('[Reverb] Failed to initialize Echo:', error);
    }
} else {
    console.warn('[Reverb] No config found, skipping Echo initialization');
}
