#!/bin/bash
set -e

echo "=========================================="
echo "Starting Marketplace Backend"
echo "=========================================="

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Check if database is already initialized
echo "Checking database status..."
python -c "
from app.core.database import SessionLocal, engine
from app.models import User
try:
    db = SessionLocal()
    user_count = db.query(User).count()
    db.close()
    if user_count > 0:
        print('Database already initialized with {} users'.format(user_count))
        exit(0)
    else:
        print('Database is empty, initializing...')
        exit(1)
except Exception as e:
    print('Database needs initialization:', str(e))
    exit(1)
"

# If exit code is 1, run init_db.py
if [ $? -eq 1 ]; then
    echo "Initializing database with test data..."
    python init_db.py
    echo "Database initialization complete!"
else
    echo "Skipping initialization - database already populated"
fi

echo "=========================================="
echo "Starting FastAPI server..."
echo "=========================================="

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
