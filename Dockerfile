FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP/Node dependencies
RUN composer install --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build \
    && composer clear-cache

# Create storage directories
RUN mkdir -p storage/logs storage/framework/cache storage/framework/views storage/framework/sessions \
    && chmod -R 775 storage

# Expose port
EXPOSE 10000

# Start server with migrations
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000"]