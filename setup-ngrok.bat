@echo off
echo ========================================
echo   QR Menu Platform - ngrok Setup
echo ========================================
echo.
echo This script will help you set up ngrok for external access
echo.

:auth_check
echo Step 1: Setting up ngrok authentication
echo.
set /p authtoken="Enter your ngrok authtoken (from https://dashboard.ngrok.com/get-started/your-authtoken): "

if "%authtoken%"=="" (
    echo Error: Authtoken cannot be empty!
    goto auth_check
)

echo.
echo Configuring ngrok with your authtoken...
ngrok config add-authtoken %authtoken%

if %errorlevel% neq 0 (
    echo Error: Failed to configure authtoken. Please check if ngrok is installed.
    echo.
    echo To install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract to a folder in your PATH
    echo 3. Or use: winget install ngrok.ngrok
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ ngrok configured successfully!
echo.
echo Step 2: Starting servers and ngrok tunnels
echo.

REM Start backend
echo Starting Backend Server...
start "QR Menu Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting Frontend Server...
start "QR Menu Frontend" cmd /k "cd frontend && npm start"

REM Wait for frontend to start
echo Waiting for frontend to start...
timeout /t 10 /nobreak >nul

REM Start ngrok for frontend
echo Starting ngrok tunnel for frontend...
start "ngrok Frontend" cmd /k "ngrok http 3000"

REM Start ngrok for backend
echo Starting ngrok tunnel for backend...
timeout /t 3 /nobreak >nul
start "ngrok Backend" cmd /k "ngrok http 5000"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 🚀 Your QR Menu Platform is now accessible worldwide!
echo.
echo Next Steps:
echo 1. Check the ngrok windows for your public URLs
echo 2. Update your frontend .env with the backend ngrok URL
echo 3. Share the frontend ngrok URL with anyone!
echo.
echo 📱 The ngrok URLs will look like:
echo   Frontend: https://abc123.ngrok.io
echo   Backend:  https://def456.ngrok.io
echo.
echo ⚠️  Important: Update frontend/.env with backend ngrok URL
echo.
pause
