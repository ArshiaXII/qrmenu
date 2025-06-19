# 🚀 QUICK DEPLOYMENT GUIDE

## 📦 Ready-to-Deploy Files Created

✅ **qr-menu-backend.zip** - Backend application  
✅ **qr-menu-frontend.zip** - Frontend application (built for production)  
✅ **DEPLOYMENT_INSTRUCTIONS.md** - Detailed setup guide  

## 🎯 DEPLOYMENT STEPS

### Step 1: Upload Files to Server

**Option A: Using WinSCP (Recommended)**
1. Download WinSCP: https://winscp.net/eng/download.php
2. Connect to server:
   - Host: `45.131.0.36`
   - Port: `40022`
   - Username: `ars`
   - Password: `ArsTurqa24`
3. Upload files:
   - Extract `qr-menu-backend.zip` to `/home/ars/qr-menu-backend/`
   - Extract `qr-menu-frontend.zip` to `/home/ars/qr-menu-frontend/`

**Option B: Using Command Line**
```bash
# Upload backend
scp -P 40022 qr-menu-backend.zip ars@45.131.0.36:/home/ars/
# Upload frontend  
scp -P 40022 qr-menu-frontend.zip ars@45.131.0.36:/home/ars/
```

### Step 2: Setup Server

**Connect to server:**
```bash
ssh -p 40022 ars@45.131.0.36
```

**Extract files:**
```bash
cd /home/ars
unzip qr-menu-backend.zip -d qr-menu-backend/
unzip qr-menu-frontend.zip -d qr-menu-frontend/
```

**Install Node.js (if needed):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

**Setup Backend:**
```bash
cd /home/ars/qr-menu-backend
npm install --production
cp .env.production .env
pm2 start server.js --name qr-menu-backend
pm2 startup
pm2 save
```

**Install & Configure Nginx:**
```bash
sudo apt update
sudo apt install nginx -y

# Create nginx config
sudo tee /etc/nginx/sites-available/qr-menu > /dev/null <<EOF
server {
    listen 80;
    server_name 45.131.0.36;
    
    location / {
        root /home/ars/qr-menu-frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
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

# Enable site
sudo ln -s /etc/nginx/sites-available/qr-menu /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3: Test Deployment

**Check services:**
```bash
pm2 status                    # Backend should be running
sudo systemctl status nginx   # Nginx should be active
```

**Test endpoints:**
```bash
curl http://localhost:5000/api    # Backend API
curl http://localhost            # Frontend
```

## 🌐 ACCESS YOUR LIVE APPLICATION

Once deployed successfully:

- **Website**: http://45.131.0.36
- **API**: http://45.131.0.36/api

## 🔑 LOGIN CREDENTIALS

- **Email**: test@qrmenu.com
- **Password**: test123

## 🔧 Troubleshooting

**Check logs:**
```bash
pm2 logs qr-menu-backend     # Backend logs
sudo tail -f /var/log/nginx/error.log  # Nginx logs
```

**Restart services:**
```bash
pm2 restart qr-menu-backend  # Restart backend
sudo systemctl restart nginx # Restart nginx
```

**Check ports:**
```bash
sudo netstat -tlnp | grep :80    # Port 80 (frontend)
sudo netstat -tlnp | grep :5000  # Port 5000 (backend)
```

## 🎉 SUCCESS!

After following these steps, your QR Menu Platform will be live and accessible to anyone on the internet at **http://45.131.0.36**!
