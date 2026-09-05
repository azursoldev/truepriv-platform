#!/bin/sh
set -e

echo "Starting Truepriv Enterprise Backend..."

# Generate app key if missing
if [ -z "$APP_KEY" ]; then
    echo "Generating Application Key..."
    php artisan key:generate --force
fi

# Setup SQLite database if no external DB_HOST provided or if DB_CONNECTION is sqlite
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_HOST" ]; then
    echo "Configuring self-contained SQLite database..."
    export DB_CONNECTION=sqlite
    export DB_DATABASE=/var/www/html/database/database.sqlite
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chown -R www-data:www-data /var/www/html/database
    chmod -R 775 /var/www/html/database
fi

# Run database migrations and seeders safely
echo "Running database migrations..."
php artisan migrate --force || true
php artisan db:seed --force || true

# Optimize cache
echo "Caching configurations..."
php artisan config:cache || true
php artisan route:cache || true

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx on port 80..."
exec nginx -g "daemon off;"
