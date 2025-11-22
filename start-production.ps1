# Start IPO Analyzer in Production Mode
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IPO Analyzer - Production Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add Node.js to PATH if needed
if (Test-Path "C:\node-v24.11.1-win-x64\node.exe") {
    $env:Path = "C:\node-v24.11.1-win-x64;$env:Path"
}

# Check for Node.js
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm.cmd --version 2>&1
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host "Please ensure Node.js is installed and in PATH." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check frontend dependencies
Write-Host "[1/3] Checking frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Setup backend
Write-Host "[2/3] Setting up backend..." -ForegroundColor Yellow
Push-Location server
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check for .env file
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "Created .env file from template" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: .env file not found. Please create it manually." -ForegroundColor Yellow
    }
}

Pop-Location

# Create frontend .env if needed
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "Created frontend .env file" -ForegroundColor Green
    }
}

Write-Host "[3/3] Starting servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server
    if (Test-Path "C:\node-v24.11.1-win-x64\node.exe") {
        $env:Path = "C:\node-v24.11.1-win-x64;$env:Path"
    }
    npm.cmd start
}

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Green
npm.cmd run dev

