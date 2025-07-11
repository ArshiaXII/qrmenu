@echo off
echo Starting QR Menu Platform for Mobile Access...
echo.
echo Your computer IP: 192.168.1.3
echo Frontend will be available at: http://192.168.1.3:3001
echo Backend will be available at: http://192.168.1.3:5000
echo.
echo Make sure your phone is connected to the same Wi-Fi network!
echo.

REM Start backend server
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend server with network access
echo Starting frontend server with network access...
start "Frontend Server" cmd /k "cd frontend && npm run start:network"

echo.
echo Both servers are starting...
echo Check the opened terminal windows for status.
echo.
echo To access from your phone:
echo 1. Make sure your phone is on the same Wi-Fi network
echo 2. Open browser on your phone
echo 3. Go to: http://192.168.1.3:3001
echo.
pause
