# Check Node.js Installation
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
Write-Host ""

# Check if node is in PATH
$nodeInPath = Get-Command node -ErrorAction SilentlyContinue
if ($nodeInPath) {
    Write-Host "✓ Node.js found in PATH!" -ForegroundColor Green
    node --version
    npm --version
    Write-Host ""
    Write-Host "You can now run: npm install" -ForegroundColor Green
    exit 0
}

# Check common installation locations
Write-Host "Node.js not found in PATH. Checking common locations..." -ForegroundColor Yellow
Write-Host ""

$locations = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

$found = $false
foreach ($loc in $locations) {
    if (Test-Path $loc) {
        Write-Host "✓ Found Node.js at: $loc" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "✗ Node.js not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. Node.js is installed from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. You have RESTARTED your terminal/PowerShell after installation" -ForegroundColor Yellow
    Write-Host "3. Node.js was added to PATH during installation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If Node.js is installed but not working:" -ForegroundColor Cyan
    Write-Host "- Close this terminal completely" -ForegroundColor Cyan
    Write-Host "- Open a NEW terminal window" -ForegroundColor Cyan
    Write-Host "- Navigate back to this directory" -ForegroundColor Cyan
    Write-Host "- Try again" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "Node.js is installed but not in PATH." -ForegroundColor Yellow
    Write-Host "Please restart your terminal for PATH changes to take effect." -ForegroundColor Yellow
}
