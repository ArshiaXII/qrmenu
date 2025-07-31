@echo off
echo ========================================
echo   QR Menu Platform - Network Access
echo ========================================
echo.
echo Starting servers for network access...
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

echo Your Local IP: %LOCAL_IP%
echo.
echo Frontend will be available at:
echo   - Local: http://localhost:3000
echo   - Network: http://%LOCAL_IP%:3000
echo.
echo Backend API will be available at:
echo   - Local: http://localhost:5000
echo   - Network: http://%LOCAL_IP%:5000
echo.
echo ========================================
echo.

REM Start backend in new window
echo Starting Backend Server...
start "QR Menu Backend" cmd /k "cd backend && set HOST=0.0.0.0 && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend Server...
start "QR Menu Frontend" cmd /k "cd frontend && set HOST=0.0.0.0 && npm start"

echo.
echo Both servers are starting...
echo.
echo To access from your phone:
echo 1. Make sure your phone is on the same WiFi network
echo 2. Open browser on your phone
echo 3. Go to: http://%LOCAL_IP%:3000
echo.
echo Press any key to exit this window...
pause >nul
