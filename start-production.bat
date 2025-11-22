@echo off
REM Start IPO Analyzer in Production Mode
echo ========================================
echo IPO Analyzer - Production Mode
echo ========================================
echo.

REM Check for Node.js
if exist "C:\node-v24.11.1-win-x64\node.exe" (
    set "PATH=C:\node-v24.11.1-win-x64;%PATH%"
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please ensure Node.js is installed and in PATH.
    pause
    exit /b 1
)

echo [1/3] Checking frontend dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm.cmd install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo [2/3] Setting up backend...
cd server
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm.cmd install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
)

REM Check for .env file
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.production .env >nul 2>&1
    if not exist ".env" (
        echo [WARNING] Could not create .env file. Please create it manually.
    )
)

cd ..

echo [3/3] Starting servers...
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "IPO Analyzer Backend" cmd /k "cd server && npm.cmd start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
call npm.cmd run dev

pause

