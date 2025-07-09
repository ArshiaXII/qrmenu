#!/bin/bash

# QR Menu Platform Deployment Script
echo "🚀 Starting QR Menu Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Navigate to frontend directory
cd frontend

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Build the project
print_status "Building production version..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "Build completed successfully"

# Check if build directory exists
if [ ! -d "build" ]; then
    print_error "Build directory not found"
    exit 1
fi

print_success "Build directory created: $(du -sh build | cut -f1)"

# Create deployment info
echo "{
  \"deploymentDate\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"version\": \"1.0.0\",
  \"environment\": \"production\",
  \"buildSize\": \"$(du -sh build | cut -f1)\"
}" > build/deployment-info.json

print_success "Deployment info created"

# Instructions for deployment
echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📁 Build files are located in: frontend/build/"
echo ""
echo "🌐 To deploy to a web server:"
echo "   1. Upload the contents of 'frontend/build/' to your web server"
echo "   2. Configure your web server to serve index.html for all routes"
echo "   3. Ensure your web server supports client-side routing"
echo ""
echo "🔧 For Apache (.htaccess):"
echo "   RewriteEngine On"
echo "   RewriteCond %{REQUEST_FILENAME} !-f"
echo "   RewriteCond %{REQUEST_FILENAME} !-d"
echo "   RewriteRule . /index.html [L]"
echo ""
echo "🔧 For Nginx:"
echo "   location / {"
echo "     try_files \$uri \$uri/ /index.html;"
echo "   }"
echo ""
echo "✅ Your QR Menu Platform is ready for deployment!"
