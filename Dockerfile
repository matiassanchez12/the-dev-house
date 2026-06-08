FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    postgresql-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring fileinfo pcntl opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install FrankenPHP
COPY --from=dunglas/frankenphp:latest /usr/local/bin/frankenphp /usr/local/bin/frankenphp

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Create Caddyfile
RUN printf '{ \n    admin off\n    http_port 10000\n    server { \n        root * /var/www/html/public\n        php_server\n    }\n}\n' > Caddyfile

# Install PHP/Node dependencies and optimize
RUN composer install --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build \
    && composer clear-cache \
    && php artisan optimize

# Create storage directories
RUN mkdir -p storage/logs storage/framework/cache storage/framework/views storage/framework/sessions \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R nobody:nobody storage bootstrap/cache

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports
EXPOSE 10000 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["web"]