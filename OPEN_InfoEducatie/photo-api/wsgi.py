#!/usr/bin/env python3
"""
WSGI entry point for the photo-to-coloring API
"""

from app import app

if __name__ == "__main__":
    app.run()