# Quick Deploy Script - Build locally and upload to server
# Bu script lokal build yapıp sunucuya upload eder

param(
    [string]$ServerIP = "45.131.0.36",
    [string]$ServerPort = "40022", 
    [string]$ServerUser = "ars"
)

Write-Host "🚀 Quick Deploy - Local Build + Upload" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "frontend") -or !(Test-Path "backend")) {
    Write-Host "❌ Please run this script from the qr-menu-platform root directory" -ForegroundColor Red
    exit 1
}

# 1. Build Frontend Locally
Write-Host "🎨 Building frontend locally..." -ForegroundColor Yellow
Set-Location "frontend"

# Check if build directory exists and remove it
if (Test-Path "build") {
    Write-Host "🗑️ Removing old build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "build"
}

# Build frontend
Write-Host "🔨 Creating production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "✅ Frontend build completed!" -ForegroundColor Green
Set-Location ".."

# 2. Create production .env for backend
Write-Host "📝 Creating production .env..." -ForegroundColor Yellow
$envContent = @"
PORT=5000
JWT_SECRET=qrmenu_super_secret_jwt_key_2024_production
NODE_ENV=production
DB_HOST=45.131.0.36
DB_PORT=3306
DB_USER=ars
DB_PASSWORD=ArsTurqa24
DB_NAME=qrmenu_production
"@

$envContent | Out-File -FilePath "backend\.env.production" -Encoding UTF8

# 3. Upload to Server
Write-Host "📡 Uploading to server..." -ForegroundColor Yellow

# Create directories on server
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
ssh -p $ServerPort $ServerUser@$ServerIP "mkdir -p /home/ars/qrmenu-app/backend /home/ars/qrmenu-app/frontend"

# Upload backend files
Write-Host "📦 Uploading backend..." -ForegroundColor Yellow
scp -P $ServerPort -r backend/* $ServerUser@${ServerIP}:/home/ars/qrmenu-app/backend/

# Upload frontend build
Write-Host "🎨 Uploading frontend build..." -ForegroundColor Yellow
scp -P $ServerPort -r frontend/build/* $ServerUser@${ServerIP}:/home/ars/qrmenu-app/frontend/

# 4. Setup and start services on server
Write-Host "⚙️ Setting up server..." -ForegroundColor Yellow

$setupCommands = @"
# Go to backend directory
cd /home/ars/qrmenu-app/backend

# Copy production env
cp .env.production .env

# Install production dependencies only
npm install --production --legacy-peer-deps

# Stop existing PM2 processes
pm2 stop qrmenu-backend 2>/dev/null || true
pm2 delete qrmenu-backend 2>/dev/null || true

# Start backend with PM2
pm2 start server.js --name qrmenu-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup (if not already done)
pm2 startup systemd -u ars --hp /home/ars 2>/dev/null || true

# Install and configure nginx if not exists
if ! command -v nginx &> /dev/null; then
    sudo apt update
    sudo apt install -y nginx
fi

# Create nginx config
sudo tee /etc/nginx/sites-available/qrmenu > /dev/null << 'EOF'
server {
    listen 80;
    server_name 45.131.0.36;

    # Frontend
    location / {
        root /home/ars/qrmenu-app/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/qrmenu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Server setup completed!"
"@

ssh -p $ServerPort $ServerUser@$ServerIP $setupCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your QR Menu Platform is now live!" -ForegroundColor Cyan
    Write-Host "   Frontend: http://$ServerIP" -ForegroundColor White
    Write-Host "   Backend API: http://$ServerIP:5000/api" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Check status:" -ForegroundColor Yellow
    Write-Host "   ssh -p $ServerPort $ServerUser@$ServerIP 'pm2 status'" -ForegroundColor White
    Write-Host "   ssh -p $ServerPort $ServerUser@$ServerIP 'sudo systemctl status nginx'" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed! Check the error messages above." -ForegroundColor Red
}

# Clean up
Remove-Item "backend\.env.production" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your app at http://$ServerIP" -ForegroundColor White
Write-Host "2. Register a new account" -ForegroundColor White
Write-Host "3. Create your first menu" -ForegroundColor White
