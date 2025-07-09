# QR Menu Platform - Deployment Guide

## 🚀 Production Deployment

This guide will help you deploy the QR Menu Platform to a production environment.

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Web server (Apache, Nginx, or similar)

### Quick Deployment

1. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Upload build files:**
   - Upload the contents of `frontend/build/` to your web server
   - Ensure your web server is configured for client-side routing

### Manual Deployment

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy build files:**
   - Copy `frontend/build/*` to your web server's document root

### Web Server Configuration

#### Apache (.htaccess)
Create a `.htaccess` file in your web root:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Nginx
Add to your server configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Features Included

✅ **Complete QR Menu Platform**
- User registration and authentication
- Restaurant onboarding wizard
- Menu creation and editing
- Design customization
- QR code generation
- Public menu viewing
- Multi-language support (Turkish/English)
- Mobile-responsive design

✅ **Production Optimizations**
- Minified and optimized build
- Source maps disabled
- Debug tools removed
- Console logging minimized
- Performance optimized

### Environment Configuration

The platform uses localStorage for data persistence, making it:
- ✅ **Zero-dependency** - No database required
- ✅ **Easy to deploy** - Static files only
- ✅ **Fast performance** - Client-side data storage
- ✅ **Offline capable** - Works without internet after initial load

### Post-Deployment

1. **Test the deployment:**
   - Visit your domain
   - Register a new account
   - Complete the onboarding process
   - Create a menu and test activation
   - Verify public menu access

2. **Monitor performance:**
   - Check loading times
   - Test on mobile devices
   - Verify QR code functionality

### Support

For deployment issues or questions, check the console for any errors and ensure:
- All files are uploaded correctly
- Web server routing is configured
- HTTPS is enabled (recommended)

### Version Information

- **Version:** 1.0.0
- **Build Date:** Generated during deployment
- **Environment:** Production
- **Framework:** React 18.2.0
