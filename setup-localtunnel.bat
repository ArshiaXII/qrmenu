@echo off
echo ========================================
echo   QR Menu Platform - LocalTunnel Setup
echo ========================================
echo.
echo Setting up LocalTunnel (no signup required)
echo.

REM Check if localtunnel is installed
npm list -g localtunnel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing LocalTunnel...
    npm install -g localtunnel
    if %errorlevel% neq 0 (
        echo Error: Failed to install LocalTunnel
        echo Please run as administrator or install manually:
        echo npm install -g localtunnel
        pause
        exit /b 1
    )
)

echo.
echo ✅ LocalTunnel is ready!
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

REM Start LocalTunnel for frontend
echo Starting LocalTunnel for frontend...
start "LocalTunnel Frontend" cmd /k "lt --port 3000 --subdomain qrmenu-frontend"

REM Start LocalTunnel for backend
echo Starting LocalTunnel for backend...
timeout /t 3 /nobreak >nul
start "LocalTunnel Backend" cmd /k "lt --port 5000 --subdomain qrmenu-backend"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 🚀 Your QR Menu Platform is now accessible worldwide!
echo.
echo 📱 Your URLs should be:
echo   Frontend: https://qrmenu-frontend.loca.lt
echo   Backend:  https://qrmenu-backend.loca.lt
echo.
echo ⚠️  Important: 
echo 1. Update frontend/.env with backend LocalTunnel URL
echo 2. If subdomain is taken, LocalTunnel will assign a random one
echo.
echo Next Steps:
echo 1. Check the LocalTunnel windows for your actual URLs
echo 2. Update frontend configuration if needed
echo 3. Share the frontend URL with anyone!
echo.
pause
