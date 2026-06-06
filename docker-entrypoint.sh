#!/bin/sh
set -e

SERVICE="${SERVICE:-web}"

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "SomeRandomString" ]; then
    echo "→ Generating APP_KEY..."
    export APP_KEY=$(php artisan key:generate --show --force)
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "→ Running migrations..."
    php artisan migrate --force
fi

if [ "$RUN_SEEDERS" = "true" ]; then
    echo "→ Running seeders..."
    php artisan db:seed --force
fi

case "$SERVICE" in
    web)
        echo "→ Starting web server on port ${PORT:-10000}..."
        exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
        ;;
    worker)
        echo "→ Starting queue worker..."
        exec php artisan queue:work --tries=3 --timeout=90
        ;;
    reverb)
        echo "→ Starting Reverb WebSocket server..."
        exec php artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
        ;;
    *)
        echo "Unknown service: $SERVICE. Must be web, worker, or reverb."
        exit 1
        ;;
esac
