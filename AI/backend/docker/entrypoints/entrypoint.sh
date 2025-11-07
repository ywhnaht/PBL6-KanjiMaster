#!/bin/sh
set -e

echo "🚀 Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "✅ Migrations done, starting Daphne..."

# Chạy Daphne server
exec daphne -b 0.0.0.0 -p 8000 drf_course_main.asgi:application