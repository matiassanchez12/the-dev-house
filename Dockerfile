FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_REVERB_APP_KEY=devcollab-key
ARG VITE_REVERB_HOST=localhost
ARG VITE_REVERB_PORT=8080
ARG VITE_REVERB_SCHEME=http
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY \
    VITE_REVERB_HOST=$VITE_REVERB_HOST \
    VITE_REVERB_PORT=$VITE_REVERB_PORT \
    VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

RUN npm run build

FROM php:8.2-fpm-bookworm AS backend

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gettext-base \
        git \
        libfreetype6-dev \
        libicu-dev \
        libcurl4-openssl-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libpq-dev \
        libzip-dev \
        libxml2-dev \
        nginx \
        supervisor \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        curl \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_pgsql \
        xml \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY . .

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

COPY --from=frontend /app/public/build ./public/build

COPY docker/nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PORT=8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

EXPOSE 8080
