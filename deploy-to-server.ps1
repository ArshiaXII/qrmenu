# PowerShell Deployment Script for QR Menu Platform
# This script will deploy both frontend and backend to your server

param(
    [string]$ServerIP = "45.131.0.36",
    [string]$ServerUser = "ars",
    [string]$ServerPort = "40022"
)

Write-Host "🚀 Starting deployment to server $ServerIP" -ForegroundColor Green

# Check if required tools are available
if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP not found. Please install OpenSSH or use WinSCP" -ForegroundColor Red
    exit 1
}

# Create deployment directory structure on server
Write-Host "📁 Creating directory structure on server..." -ForegroundColor Yellow
ssh -p $ServerPort $ServerUser@$ServerIP "mkdir -p /home/ars/qr-menu-platform/backend /home/ars/qr-menu-platform/frontend"

# Deploy Backend
Write-Host "📦 Deploying backend..." -ForegroundColor Yellow
scp -P $ServerPort -r backend/* $ServerUser@${ServerIP}:/home/ars/qr-menu-platform/backend/

# Deploy Frontend Build
Write-Host "🎨 Deploying frontend..." -ForegroundColor Yellow
scp -P $ServerPort -r frontend/build/* $ServerUser@${ServerIP}:/home/ars/qr-menu-platform/frontend/

# Install dependencies and start services on server
Write-Host "⚙️ Installing dependencies and starting services..." -ForegroundColor Yellow
ssh -p $ServerPort $ServerUser@$ServerIP @"
cd /home/ars/qr-menu-platform/backend
npm install --production
cp .env.production .env
pm2 stop qr-menu-backend 2>/dev/null || true
pm2 start server.js --name qr-menu-backend
pm2 save
"@

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your application should be accessible at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://$ServerIP" -ForegroundColor Cyan
Write-Host "   Backend API: http://$ServerIP:5000" -ForegroundColor Cyan
