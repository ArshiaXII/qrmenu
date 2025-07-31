@echo off
echo ========================================
echo   QR Menu Platform - ngrok HTTPS Setup
echo ========================================
echo.
echo This script will:
echo 1. Start your backend server (port 5000)
echo 2. Start your frontend server (port 3000)
echo 3. Create secure HTTPS tunnels for both
echo 4. Show you the URLs to update your config
echo.

REM Check if ngrok is configured
ngrok config check >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok is not configured with an authtoken!
    echo.
    echo Please run: ngrok config add-authtoken YOUR_TOKEN
    echo Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is configured!
echo.

REM Start backend server
echo 🚀 Starting Backend Server (port 5000)...
start "QR Menu Backend" cmd /k "cd backend && echo Backend starting on http://localhost:5000 && npm start"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 8 /nobreak >nul

REM Start frontend server
echo 🚀 Starting Frontend Server (port 3000)...
start "QR Menu Frontend" cmd /k "cd frontend && echo Frontend starting on http://localhost:3000 && npm start"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 15 /nobreak >nul

REM Start ngrok tunnels using config file
echo 🌐 Starting ngrok tunnels...
start "ngrok Tunnels" cmd /k "echo Starting ngrok tunnels... && ngrok start --all --config ngrok.yml"

echo.
echo ========================================
echo   🎉 Setup Complete!
echo ========================================
echo.
echo ⏳ Please wait for all services to start, then:
echo.
echo 📋 STEP-BY-STEP INSTRUCTIONS:
echo.
echo 1️⃣  Check the "ngrok Tunnels" window for your URLs
echo     Look for lines like:
echo     • api tunnel: https://abc123.ngrok-free.app
echo     • web tunnel: https://def456.ngrok-free.app
echo.
echo 2️⃣  Copy the API tunnel URL (the one for port 5000)
echo.
echo 3️⃣  Open: frontend\.env
echo     Replace: REACT_APP_API_URL=https://YOUR_NGROK_API_URL_HERE/api
echo     With:    REACT_APP_API_URL=https://YOUR_ACTUAL_API_URL/api
echo     Example: REACT_APP_API_URL=https://abc123.ngrok-free.app/api
echo.
echo 4️⃣  Save the file and restart the frontend:
echo     • Close the "QR Menu Frontend" window
echo     • Run: cd frontend && npm start
echo.
echo 5️⃣  Access your app using the WEB tunnel URL
echo     Example: https://def456.ngrok-free.app
echo.
echo ⚠️  IMPORTANT: Both URLs change each time you restart ngrok!
echo     You'll need to update the .env file each time.
echo.
echo 🔗 Your app will be accessible worldwide via HTTPS!
echo.
pause
