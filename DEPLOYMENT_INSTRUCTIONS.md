# 🚀 QR Menu Platform Deployment Instructions

## Server Details
- **IP**: 45.131.0.36
- **SSH Port**: 40022
- **User**: ars
- **Password**: ArsTurqa24

## 📦 Files to Upload

### Backend Files (Upload to `/home/ars/qr-menu-backend/`)
- All files from `backend/` folder
- Use `.env.production` as `.env`

### Frontend Files (Upload to `/home/ars/qr-menu-frontend/`)
- All files from `frontend/build/` folder

## 🔧 Server Setup Commands

### 1. Connect to Server
```bash
ssh -p 40022 ars@45.131.0.36
```

### 2. Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Install Nginx (Web Server)
```bash
sudo apt update
sudo apt install nginx -y
```

### 5. Setup Backend
```bash
cd /home/ars/qr-menu-backend
npm install --production
cp .env.production .env
pm2 start server.js --name qr-menu-backend
pm2 startup
pm2 save
```

### 6. Setup Frontend (Nginx Configuration)
```bash
sudo nano /etc/nginx/sites-available/qr-menu
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 45.131.0.36;
    
    # Frontend
    location / {
        root /home/ars/qr-menu-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/qr-menu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🌐 Access Your Application
- **Website**: http://45.131.0.36
- **API**: http://45.131.0.36/api

## 🔍 Troubleshooting Commands
```bash
# Check backend status
pm2 status
pm2 logs qr-menu-backend

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check if ports are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :5000
```
