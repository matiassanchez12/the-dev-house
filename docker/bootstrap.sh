#!/bin/sh
set -e

if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi
echo "Running migrations..."
php artisan migrate --force
echo "Running seeders..."
php artisan db:seed --force
echo "Installing npm dependencies..."
npm install
echo "Building frontend assets..."
npm run build
echo "Setup complete!"