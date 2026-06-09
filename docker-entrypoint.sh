#!/bin/sh
set -eu

SERVICE="${SERVICE:-web}"
PORT="${PORT:-8080}"
export PORT

render_nginx_config() {
    envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
}

cache_config() {
    echo "→ Caching config..."
    php artisan config:cache
}

run_database_bootstrap() {
    if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
        echo "→ Running migrations..."
        php artisan migrate --force
    fi

    if [ "${RUN_SEEDERS:-false}" = "true" ]; then
        echo "→ Running seeders..."
        php artisan db:seed --force
    fi
}

case "$SERVICE" in
    web)
        echo "→ Preparing nginx and php-fpm on port ${PORT}..."
        render_nginx_config
        cache_config
        run_database_bootstrap

        if [ "$#" -eq 0 ]; then
            set -- /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
        fi

        exec "$@"
        ;;
    worker)
        cache_config
        exec php artisan queue:work redis --tries=3 --timeout=90 --sleep=3 --max-jobs=100
        ;;
    reverb)
        cache_config
        exec php artisan reverb:start --host=0.0.0.0 --port="$PORT"
        ;;
    *)
        echo "Unknown service: $SERVICE. Must be web, worker, or reverb."
        exit 1
        ;;
esac
