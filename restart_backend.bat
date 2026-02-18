@echo off
echo Restarting Backend Server...
echo.

REM Kill any existing Python processes running uvicorn
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the backend
cd backend
echo Starting FastAPI server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
