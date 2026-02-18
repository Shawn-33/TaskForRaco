#!/bin/bash

# Project Marketplace Setup Script
# This script sets up the entire project environment

set -e

echo "=========================================="
echo "Project Marketplace Setup"
echo "=========================================="

# Check Python
echo "Checking Python installation..."
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed. Please install Python 3.9+"
    exit 1
fi

# Setup Backend
echo ""
echo "Setting up backend..."
cd backend

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads

echo "Backend setup complete!"

# Setup Frontend
cd ../frontend

echo ""
echo "Setting up frontend..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "Installing Node.js dependencies..."
npm install

echo "Frontend setup complete!"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To run the application:"
echo "1. Terminal 1: cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
