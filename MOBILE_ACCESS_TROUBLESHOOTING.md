# 📱 Mobile Access Troubleshooting Guide

## 🔍 Problem: Can access from PC but not from mobile

Your QR menu platform is deployed at `http://45.131.0.36` but mobile devices can't access it.

## 🛠️ Solutions (Try in order)

### **Solution 1: Fix Server Configuration**
Run this on your server:
```bash
# Upload and run the mobile fix script
chmod +x fix-mobile-access.sh
./fix-mobile-access.sh
```

### **Solution 2: Enable HTTPS (Recommended)**
Many mobile browsers require HTTPS. Run this on your server:
```bash
# Upload and run the HTTPS setup script
chmod +x enable-https.sh
./enable-https.sh
```

### **Solution 3: Check Firewall Settings**
```bash
# On your server, check if ports are open
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload

# Check if services are listening
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### **Solution 4: Mobile Browser Issues**

#### **Clear Browser Cache:**
1. Open browser settings on your phone
2. Clear browsing data/cache
3. Try accessing the site again

#### **Try Different Browsers:**
- Chrome Mobile
- Firefox Mobile
- Safari (iOS)
- Samsung Internet

#### **Disable Data Saver:**
Some mobile browsers have data saver modes that block certain sites.

### **Solution 5: Network Issues**

#### **Try Mobile Data:**
If WiFi doesn't work, try using mobile data to rule out network restrictions.

#### **Check DNS:**
Some networks block certain IP addresses. Try:
1. Using a VPN on your phone
2. Using a different network
3. Using mobile data instead of WiFi

## 🔧 Server-Side Diagnostics

### **Check if server is accessible:**
```bash
# On your server
curl -I http://localhost/
curl -I http://45.131.0.36/

# Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Check services status:**
```bash
# Nginx status
sudo systemctl status nginx

# Backend status
pm2 status
pm2 logs qrmenu-backend

# Check if ports are open
sudo ss -tlnp | grep :80
sudo ss -tlnp | grep :5000
```

## 📱 Mobile-Specific Tests

### **Test from different devices:**
1. **Android phones** - Try Chrome, Firefox
2. **iPhones** - Try Safari, Chrome
3. **Tablets** - Test on both Android and iOS tablets

### **Test different URLs:**
1. `http://45.131.0.36`
2. `http://45.131.0.36/`
3. `https://45.131.0.36` (if HTTPS is enabled)

## 🚨 Common Issues & Fixes

### **Issue: "This site can't be reached"**
**Cause:** Server not accessible from mobile network
**Fix:** 
- Check firewall settings
- Ensure Nginx is running
- Try enabling HTTPS

### **Issue: "Connection refused"**
**Cause:** Service not running or port blocked
**Fix:**
```bash
sudo systemctl restart nginx
pm2 restart qrmenu-backend
```

### **Issue: "Insecure connection blocked"**
**Cause:** Mobile browser blocking HTTP
**Fix:** Enable HTTPS using the `enable-https.sh` script

### **Issue: Blank page or loading forever**
**Cause:** CORS issues or API not accessible
**Fix:** Check backend logs and update CORS settings

## 🔍 Debug Steps

### **Step 1: Basic connectivity**
```bash
# From your server
ping 8.8.8.8  # Test internet
curl -I http://localhost/  # Test local access
```

### **Step 2: Check from external**
Use an online tool like:
- https://www.whatsmyip.org/port-scanner/
- Check if port 80 is open on 45.131.0.36

### **Step 3: Mobile browser console**
On mobile Chrome:
1. Go to `chrome://inspect`
2. Enable USB debugging
3. Check console for errors

## 📞 Quick Fix Commands

Run these on your server for immediate fixes:

```bash
# Restart all services
sudo systemctl restart nginx
pm2 restart all

# Fix permissions
sudo chown -R www-data:www-data /home/ars/qrmenu/frontend
sudo chmod -R 755 /home/ars/qrmenu/frontend

# Check configuration
sudo nginx -t
pm2 status

# View real-time logs
sudo tail -f /var/log/nginx/access.log &
pm2 logs qrmenu-backend
```

## ✅ Success Indicators

You'll know it's working when:
1. Mobile browser loads the site without errors
2. You can see the QR menu interface
3. Navigation works smoothly
4. No console errors in mobile browser

## 🆘 If Nothing Works

1. **Check server provider:** Some hosting providers block certain ports
2. **Contact support:** Your hosting provider might have restrictions
3. **Try different port:** Configure Nginx to use port 8080 instead of 80
4. **Use domain name:** Get a domain name and point it to your server IP

## 📊 Monitoring

After fixing, monitor with:
```bash
# Real-time access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Backend logs
pm2 logs qrmenu-backend --lines 50
```
