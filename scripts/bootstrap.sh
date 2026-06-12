#!/usr/bin/env bash

set -euo pipefail

SAIL="./vendor/bin/sail"

if [ ! -x "$SAIL" ]; then
    echo "vendor/bin/sail not found. Run composer install first."
    exit 1
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    "$SAIL" artisan key:generate --force
fi

"$SAIL" artisan migrate --seed
"$SAIL" npm install
