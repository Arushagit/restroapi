#!/usr/bin/env bash
set -o errexit

if [ -d "backend" ]; then
    echo "Running build from project root..."
    pip install -r backend/requirements.txt
    python backend/manage.py collectstatic --no-input
    python backend/manage.py migrate
    python backend/manage.py seed_data
else
    echo "Running build from backend directory..."
    pip install -r requirements.txt
    python manage.py collectstatic --no-input
    python manage.py migrate
    python manage.py seed_data
fi
