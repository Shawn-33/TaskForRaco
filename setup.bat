@echo off
REM Project Marketplace Setup Script for Windows

echo ==========================================
echo Project Marketplace Setup
echo ==========================================

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.9+
    exit /b 1
)

REM Setup Backend
echo.
echo Setting up backend...
cd backend

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create uploads directory
echo Creating uploads directory...
if not exist uploads mkdir uploads

echo Backend setup complete!

REM Setup Frontend
cd ..\frontend

echo.
echo Setting up frontend...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 16+
    exit /b 1
)

echo Installing Node.js dependencies...
npm install

echo Frontend setup complete!

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To run the application:
echo 1. Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& python -m uvicorn app.main:app --reload
echo 2. Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Then visit: http://localhost:3000
echo.

pause
