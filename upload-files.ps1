# Simple file upload script using WinSCP or SFTP
# Run this script to upload files to your server

Write-Host "🚀 QR Menu Platform File Upload Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$ServerIP = "45.131.0.36"
$ServerUser = "ars"
$ServerPort = "40022"

Write-Host "Server: $ServerUser@$ServerIP:$ServerPort" -ForegroundColor Cyan

# Check if WinSCP is available
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
if (Test-Path $winscpPath) {
    Write-Host "✅ WinSCP found, using automated upload..." -ForegroundColor Green
    
    # Create WinSCP script
    $scriptContent = @"
open sftp://$ServerUser@$ServerIP:$ServerPort
cd /home/ars
mkdir qr-menu-backend
mkdir qr-menu-frontend
cd qr-menu-backend
put backend\* .
cd ../qr-menu-frontend  
put frontend\build\* .
exit
"@
    
    $scriptContent | Out-File -FilePath "upload-script.txt" -Encoding ASCII
    
    Write-Host "📦 Uploading files..." -ForegroundColor Yellow
    & $winscpPath /script=upload-script.txt
    
    Remove-Item "upload-script.txt"
    Write-Host "✅ Upload completed!" -ForegroundColor Green
    
} else {
    Write-Host "❌ WinSCP not found at $winscpPath" -ForegroundColor Red
    Write-Host "📋 Manual upload instructions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Download WinSCP from: https://winscp.net/eng/download.php" -ForegroundColor Cyan
    Write-Host "2. Connect to server:" -ForegroundColor Cyan
    Write-Host "   Host: $ServerIP" -ForegroundColor White
    Write-Host "   Port: $ServerPort" -ForegroundColor White
    Write-Host "   Username: $ServerUser" -ForegroundColor White
    Write-Host "   Password: ArsTurqa24" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Upload these folders:" -ForegroundColor Cyan
    Write-Host "   - Upload 'backend\*' to '/home/ars/qr-menu-backend/'" -ForegroundColor White
    Write-Host "   - Upload 'frontend\build\*' to '/home/ars/qr-menu-frontend/'" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Then follow the server setup instructions in DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📖 Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH to your server: ssh -p $ServerPort $ServerUser@$ServerIP" -ForegroundColor White
Write-Host "2. Follow the setup instructions in DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "3. Your app will be live at: http://$ServerIP" -ForegroundColor Green
