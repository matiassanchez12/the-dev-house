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
    && docker-php-ext-install pdo pdo_pgsql mbstring fileinfo pcntl

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

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports
EXPOSE 10000 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["web"]
