@echo off
echo ========================================
echo   QR Menu Platform - Cloudflare Tunnel
echo ========================================
echo.
echo Setting up Cloudflare Tunnel (free, no signup required)
echo.

REM Check if cloudflared is installed
cloudflared --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Cloudflared not found. Please install it first:
    echo.
    echo Option 1: Download from https://github.com/cloudflare/cloudflared/releases
    echo Option 2: Use winget: winget install Cloudflare.cloudflared
    echo.
    set /p install_choice="Do you want to install via winget now? (y/n): "
    if /i "%install_choice%"=="y" (
        echo Installing cloudflared...
        winget install Cloudflare.cloudflared
        if %errorlevel% neq 0 (
            echo Failed to install. Please install manually.
            pause
            exit /b 1
        )
    ) else (
        echo Please install cloudflared manually and run this script again.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Cloudflared is ready!
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

REM Start Cloudflare tunnel for frontend
echo Starting Cloudflare tunnel for frontend...
start "Cloudflare Frontend" cmd /k "cloudflared tunnel --url http://localhost:3000"

REM Start Cloudflare tunnel for backend
echo Starting Cloudflare tunnel for backend...
timeout /t 3 /nobreak >nul
start "Cloudflare Backend" cmd /k "cloudflared tunnel --url http://localhost:5000"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 🚀 Your QR Menu Platform is now accessible worldwide!
echo.
echo 📱 Check the Cloudflare tunnel windows for your URLs
echo They will look like: https://abc-123-def.trycloudflare.com
echo.
echo ⚠️  Important: 
echo 1. Note down both URLs from the tunnel windows
echo 2. Update frontend/.env with the backend tunnel URL
echo 3. Share the frontend tunnel URL with anyone!
echo.
echo Next Steps:
echo 1. Check the tunnel windows for your actual URLs
echo 2. Update frontend configuration with backend URL
echo 3. Test access from any device worldwide!
echo.
pause
