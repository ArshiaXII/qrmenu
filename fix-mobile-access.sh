#!/bin/bash
# Fix Mobile Access Issues for QR Menu Platform
# Run this script on your server to fix common mobile access problems

echo "📱 Fixing Mobile Access Issues"
echo "=============================="

# 1. Update Nginx configuration for better mobile support
echo "🔧 Updating Nginx configuration for mobile support..."

sudo tee /etc/nginx/sites-available/qrmenu > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name 45.131.0.36;

    # Security headers for mobile compatibility
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Mobile-specific headers
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;

    # Frontend (React App)
    location / {
        root /home/ars/qrmenu/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Mobile-friendly headers
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
        
        # Cache static assets but allow mobile refresh
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
            add_header Access-Control-Allow-Origin "*";
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
        
        # Mobile API headers
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    }

    # Gzip compression for mobile
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# 2. Check and fix file permissions
echo "📁 Checking file permissions..."
sudo chown -R www-data:www-data /home/ars/qrmenu/frontend
sudo chmod -R 755 /home/ars/qrmenu/frontend

# 3. Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    # 4. Restart Nginx
    echo "🔄 Restarting Nginx..."
    sudo systemctl restart nginx
    
    # 5. Check if services are running
    echo "✅ Checking services..."
    echo "Nginx status:"
    sudo systemctl is-active nginx
    
    echo "PM2 backend status:"
    pm2 list | grep qrmenu-backend || pm2 list
    
    # 6. Test connectivity
    echo "🌐 Testing connectivity..."
    curl -I http://localhost/ 2>/dev/null | head -1
    
    echo ""
    echo "✅ Mobile access fixes applied!"
    echo ""
    echo "📱 Try accessing from your phone:"
    echo "   URL: http://45.131.0.36"
    echo ""
    echo "🔧 If still not working, try:"
    echo "   1. Clear your phone's browser cache"
    echo "   2. Try a different browser on your phone"
    echo "   3. Make sure your phone has internet access"
    echo "   4. Try accessing from mobile data instead of WiFi"
    echo ""
    echo "📊 Check server logs:"
    echo "   sudo tail -f /var/log/nginx/access.log"
    echo "   sudo tail -f /var/log/nginx/error.log"
    
else
    echo "❌ Nginx configuration error. Please check the configuration."
    sudo nginx -t
fi
