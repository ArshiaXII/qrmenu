#!/bin/bash
# Enable HTTPS for QR Menu Platform
# Run this script on your server to enable SSL/HTTPS

echo "🔒 Setting up HTTPS for QR Menu Platform"
echo "========================================"

# 1. Install Certbot for Let's Encrypt SSL
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Install OpenSSL for self-signed certificate (fallback)
sudo apt install -y openssl

echo "🔧 Choose SSL certificate type:"
echo "1) Let's Encrypt (Free, requires domain name)"
echo "2) Self-signed certificate (For IP address)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "📝 For Let's Encrypt, you need a domain name pointing to your server."
    echo "If you don't have a domain, choose option 2 for self-signed certificate."
    read -p "Enter your domain name (e.g., yourdomain.com): " domain
    
    if [ -n "$domain" ]; then
        # Get Let's Encrypt certificate
        sudo certbot --nginx -d $domain
    else
        echo "❌ Domain name required for Let's Encrypt"
        exit 1
    fi
else
    echo "🔐 Creating self-signed certificate for IP address..."
    
    # Create self-signed certificate
    sudo mkdir -p /etc/ssl/private
    sudo mkdir -p /etc/ssl/certs
    
    # Generate private key
    sudo openssl genrsa -out /etc/ssl/private/qrmenu.key 2048
    
    # Generate certificate
    sudo openssl req -new -x509 -key /etc/ssl/private/qrmenu.key -out /etc/ssl/certs/qrmenu.crt -days 365 -subj "/C=TR/ST=Istanbul/L=Istanbul/O=QR Menu/CN=45.131.0.36"
    
    # Update Nginx configuration for HTTPS
    sudo tee /etc/nginx/sites-available/qrmenu > /dev/null <<EOF
server {
    listen 80;
    server_name 45.131.0.36;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 45.131.0.36;

    ssl_certificate /etc/ssl/certs/qrmenu.crt;
    ssl_certificate_key /etc/ssl/private/qrmenu.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

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
fi

# 3. Test and restart Nginx
echo "🔄 Testing and restarting Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ HTTPS enabled successfully!"
    echo ""
    echo "🌐 Your application is now available at:"
    echo "   HTTPS: https://45.131.0.36"
    echo "   HTTP: http://45.131.0.36 (redirects to HTTPS)"
    echo ""
    echo "📱 Mobile users should now be able to access the site!"
    echo ""
    if [ "$choice" = "2" ]; then
        echo "⚠️  Note: Self-signed certificates will show a security warning."
        echo "   Users need to click 'Advanced' and 'Proceed to site' on mobile."
    fi
else
    echo "❌ Nginx configuration error. Please check the configuration."
fi
