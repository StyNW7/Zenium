#!/bin/bash

# Wait for Redis to be ready (if using Redis)
if [ "$USE_REDIS" = "true" ]; then
    echo "Waiting for Redis..."
    while ! nc -z redis 6379; do
        sleep 0.1
    done
    echo "Redis is up!"
fi

# Initialize the application
echo "Initializing Melify AI Therapist..."
python -c "
from model5 import build_or_load_index, build_or_load_classifier
from mood_check import FER, init_csv_if_needed
import os

print('Building/Loading index...')
vectorizer, contexts, responses, tfidf = build_or_load_index()
print('Building/Loading classifier...')
classifier = build_or_load_classifier(contexts)
print('Initializing mood detection...')
mood_detector = FER(mtcnn=True)
init_csv_if_needed()
print('All components initialized successfully!')
"

# Start Gunicorn (for production)
if [ "$FLASK_ENV" = "production" ]; then
    echo "Starting Gunicorn server..."
    exec gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 2 --timeout 120 app:app
else
    echo "Starting Flask development server..."
    exec flask run --host=0.0.0.0 --port=5000
fi