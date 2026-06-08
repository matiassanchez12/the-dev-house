FROM dunglas/frankenphp:alpine

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader \
    && npm ci \
    && npm run build \
    && composer clear-cache \
    && php artisan optimize

RUN mkdir -p storage/logs storage/framework/cache storage/framework/views storage/framework/sessions \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R nobody:nobody storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 10000 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["web"]