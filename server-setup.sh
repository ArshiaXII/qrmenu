#!/bin/bash
# QR Menu Platform - Server Setup Script
# Bu script sunucuda gerekli tüm kurulumları yapar

echo "🚀 QR Menu Platform - Server Setup"
echo "=================================="

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# 4. Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# 5. Setup directories
echo "📁 Creating project directories..."
mkdir -p /home/ars/qrmenu/backend
mkdir -p /home/ars/qrmenu/frontend

# 6. Setup Nginx configuration
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/qrmenu > /dev/null <<EOF
server {
    listen 80;
    server_name 45.131.0.36;

    # Frontend (React App)
    location / {
        root /home/ars/qrmenu/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# 7. Enable Nginx site
echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/qrmenu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 8. Test and restart Nginx
echo "🔄 Testing and restarting Nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 9. Setup PM2 startup
echo "⚙️ Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ars --hp /home/ars

# 10. Create backend .env file
echo "📝 Creating backend .env file..."
cat > /home/ars/qrmenu/backend/.env <<EOF
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=production
DB_HOST=45.131.0.36
DB_PORT=3306
DB_USER=ars
DB_PASSWORD=your_mysql_password_here
DB_NAME=qrmenu_production
EOF

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your backend files to /home/ars/qrmenu/backend/"
echo "2. Upload your frontend build files to /home/ars/qrmenu/frontend/"
echo "3. Run: cd /home/ars/qrmenu/backend && npm install --production"
echo "4. Run: pm2 start server.js --name qrmenu-backend"
echo "5. Run: pm2 save"
echo ""
echo "🌐 Your app will be available at: http://45.131.0.36"
