#!/bin/sh
set -eu

SERVICE="${SERVICE:-web}"
PORT="${PORT:-8080}"
REDIS_CLIENT="${REDIS_CLIENT:-predis}"
export PORT
export REDIS_CLIENT

normalize_redis_env() {
    if [ -z "${REDIS_HOST:-}" ] && [ -n "${REDISHOST:-}" ]; then
        REDIS_HOST="$REDISHOST"
        export REDIS_HOST
    fi

    if [ -z "${REDIS_PORT:-}" ] && [ -n "${REDISPORT:-}" ]; then
        REDIS_PORT="$REDISPORT"
        export REDIS_PORT
    fi

    if [ -z "${REDIS_USERNAME:-}" ] && [ -n "${REDISUSER:-}" ]; then
        REDIS_USERNAME="$REDISUSER"
        export REDIS_USERNAME
    fi

    if [ -z "${REDIS_PASSWORD:-}" ] && [ -n "${REDISPASSWORD:-}" ]; then
        REDIS_PASSWORD="$REDISPASSWORD"
        export REDIS_PASSWORD
    fi

    if [ -z "${REDIS_URL:-}" ] && [ -n "${REDIS_HOST:-}" ]; then
        redis_port="${REDIS_PORT:-6379}"

        if [ -n "${REDIS_PASSWORD:-}" ]; then
            if [ -n "${REDIS_USERNAME:-}" ]; then
                REDIS_URL="redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${redis_port}"
            else
                REDIS_URL="redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${redis_port}"
            fi
        else
            REDIS_URL="redis://${REDIS_HOST}:${redis_port}"
        fi

        export REDIS_URL
    fi
}

normalize_redis_env() {
    if [ -z "${REDIS_HOST:-}" ] && [ -n "${REDISHOST:-}" ]; then
        REDIS_HOST="$REDISHOST"
        export REDIS_HOST
    fi

    if [ -z "${REDIS_PORT:-}" ] && [ -n "${REDISPORT:-}" ]; then
        REDIS_PORT="$REDISPORT"
        export REDIS_PORT
    fi

    if [ -z "${REDIS_USERNAME:-}" ] && [ -n "${REDISUSER:-}" ]; then
        REDIS_USERNAME="$REDISUSER"
        export REDIS_USERNAME
    fi

    if [ -z "${REDIS_PASSWORD:-}" ] && [ -n "${REDISPASSWORD:-}" ]; then
        REDIS_PASSWORD="$REDISPASSWORD"
        export REDIS_PASSWORD
    fi

    if [ -z "${REDIS_URL:-}" ] && [ -n "${REDIS_HOST:-}" ]; then
        redis_port="${REDIS_PORT:-6379}"

        if [ -n "${REDIS_PASSWORD:-}" ]; then
            if [ -n "${REDIS_USERNAME:-}" ]; then
                REDIS_URL="redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${redis_port}"
            else
                REDIS_URL="redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${redis_port}"
            fi
        else
            REDIS_URL="redis://${REDIS_HOST}:${redis_port}"
        fi

        export REDIS_URL
    fi
}

render_nginx_config() {
    envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
}

cache_config() {
    echo "→ Caching config..."
    php artisan config:clear
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
        normalize_redis_env
        render_nginx_config
        cache_config
        run_database_bootstrap

        if [ "$#" -eq 0 ]; then
            set -- /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
        fi

        exec "$@"
        ;;
    worker)
        normalize_redis_env
        cache_config
        exec php artisan queue:work "${QUEUE_CONNECTION:-redis}" --tries=3 --timeout=90 --sleep=3 --max-jobs=100
        ;;
    reverb)
        normalize_redis_env
        cache_config
        exec php artisan reverb:start --host=0.0.0.0 --port="$PORT"
        ;;
    *)
        echo "Unknown service: $SERVICE. Must be web, worker, or reverb."
        exit 1
        ;;
esac
