# 🌐 QR Menu Platform - ngrok HTTPS Setup Guide

## 🎯 Goal
Resolve the "Mixed Content" error by making both frontend and backend accessible via secure HTTPS URLs using ngrok.

## 📋 Step-by-Step Instructions

### Prerequisites
1. **ngrok account**: Sign up at https://dashboard.ngrok.com/signup
2. **ngrok installed**: Download from https://ngrok.com/download
3. **Authtoken configured**: Get from https://dashboard.ngrok.com/get-started/your-authtoken

### Step 1: Configure ngrok Authtoken
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Step 2: Start Your Servers

#### Option A: Use Automated Script (Recommended)
```bash
# Double-click or run:
start-ngrok-tunnels.bat
```

#### Option B: Manual Startup
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
cd frontend
npm start

# Terminal 3: Start ngrok tunnels
ngrok start --all --config ngrok.yml
```

### Step 3: Get Your ngrok URLs

After running `ngrok start --all`, you'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
Forwarding                    https://def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important**: 
- `https://abc123.ngrok-free.app` (port 5000) = **API URL**
- `https://def456.ngrok-free.app` (port 3000) = **Frontend URL**

### Step 4: Update Frontend Configuration

1. **Open**: `frontend/.env`
2. **Find**: `REACT_APP_API_URL=https://YOUR_NGROK_API_URL_HERE/api`
3. **Replace with**: `REACT_APP_API_URL=https://abc123.ngrok-free.app/api`
   (Use your actual API tunnel URL)

Example:
```env
# Before
REACT_APP_API_URL=https://YOUR_NGROK_API_URL_HERE/api

# After  
REACT_APP_API_URL=https://abc123.ngrok-free.app/api
```

### Step 5: Restart Frontend

```bash
# Stop the frontend server (Ctrl+C)
# Then restart:
cd frontend
npm start
```

### Step 6: Access Your App

🎉 **Your app is now accessible worldwide!**

- **Frontend**: `https://def456.ngrok-free.app`
- **API**: `https://abc123.ngrok-free.app`

## 🔧 Troubleshooting

### Mixed Content Error Still Appears?
- ✅ Verify `REACT_APP_API_URL` in `frontend/.env` uses `https://`
- ✅ Restart frontend after changing `.env`
- ✅ Check browser console for the actual API URL being used

### ngrok URLs Not Working?
- ✅ Ensure both servers (frontend & backend) are running
- ✅ Check ngrok tunnel status: http://127.0.0.1:4040
- ✅ Verify authtoken is configured: `ngrok config check`

### CORS Errors?
- ✅ Backend already configured to allow ngrok URLs
- ✅ Check `backend/server.js` CORS configuration

### URLs Change Every Time?
- ⚠️ **Free ngrok URLs change on restart**
- 💡 **Solution**: Update `.env` each time, or upgrade to ngrok Pro for static URLs

## 📱 Mobile Testing

Once setup is complete:
1. **Share the frontend ngrok URL** with anyone
2. **Access from any device** worldwide
3. **Test on real mobile devices** over the internet
4. **Demo to clients** without local network requirements

## 🚀 Production Notes

For production deployment:
- Consider ngrok Pro for static URLs
- Or deploy to cloud services (Vercel, Netlify, Heroku)
- Use environment-specific `.env` files

## 📞 Support

If you encounter issues:
1. Check the ngrok web interface: http://127.0.0.1:4040
2. Verify all services are running
3. Check browser console for specific error messages
4. Ensure `.env` file is saved and frontend restarted
