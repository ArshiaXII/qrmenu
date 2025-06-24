# QR Menu Platform - Build and Deploy Script
# Bu script lokal build yapıp sunucuya upload eder

param(
    [string]$ServerIP = "45.131.0.36",
    [string]$ServerPort = "40022", 
    [string]$ServerUser = "ars"
)

Write-Host "🚀 QR Menu Platform - Build and Deploy" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Frontend Build
Write-Host "🎨 Building frontend..." -ForegroundColor Yellow
Set-Location "frontend"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Build frontend
Write-Host "🔨 Creating production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build completed!" -ForegroundColor Green
Set-Location ".."

# 2. Backend Dependencies Check
Write-Host "🔧 Checking backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"

if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

Set-Location ".."

# 3. Deploy to Server
Write-Host "📡 Deploying to server..." -ForegroundColor Yellow

# Create deployment directories on server
Write-Host "📁 Creating directories on server..." -ForegroundColor Yellow
ssh -p $ServerPort $ServerUser@$ServerIP "mkdir -p /home/ars/qrmenu/backend /home/ars/qrmenu/frontend"

# Deploy Backend
Write-Host "📦 Uploading backend files..." -ForegroundColor Yellow
scp -P $ServerPort -r backend/* $ServerUser@${ServerIP}:/home/ars/qrmenu/backend/

# Deploy Frontend Build
Write-Host "🎨 Uploading frontend build..." -ForegroundColor Yellow
scp -P $ServerPort -r frontend/build/* $ServerUser@${ServerIP}:/home/ars/qrmenu/frontend/

# 4. Server Setup
Write-Host "⚙️ Setting up server..." -ForegroundColor Yellow

$serverCommands = @"
cd /home/ars/qrmenu/backend
npm install --production
pm2 stop qrmenu-backend 2>/dev/null || true
pm2 delete qrmenu-backend 2>/dev/null || true
pm2 start server.js --name qrmenu-backend
pm2 save
sudo systemctl enable pm2-ars
"@

ssh -p $ServerPort $ServerUser@$ServerIP $serverCommands

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is now live at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://$ServerIP" -ForegroundColor White
Write-Host "   Backend API: http://$ServerIP:5000" -ForegroundColor White
Write-Host ""
Write-Host "📊 Check status with:" -ForegroundColor Yellow
Write-Host "   ssh -p $ServerPort $ServerUser@$ServerIP 'pm2 status'" -ForegroundColor White
