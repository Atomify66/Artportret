#!/bin/bash
# Start script for the photo-to-coloring API

# Activate virtual environment
source venv/bin/activate

# Start the application with gunicorn
gunicorn --bind 127.0.0.1:5000 --workers 2 --timeout 120 wsgi:app