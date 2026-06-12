import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const reverbConfig = window.__REVERB_CONFIG__;

if (reverbConfig?.key) {
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
                window.axios.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name,
                }).then((response) => {
                    callback(null, response.data);
                }).catch((error) => {
                    callback(error, null);
                });
            },
        }),
    });
}
