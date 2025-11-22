@echo off
REM Quick Deploy Script for IPO Analyzer
echo ========================================
echo IPO Analyzer - Build for Deployment
echo ========================================
echo.

REM Check for Node.js
if exist "C:\node-v24.11.1-win-x64\node.exe" (
    set "PATH=C:\node-v24.11.1-win-x64;%PATH%"
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)

echo [1/2] Installing dependencies...
call npm.cmd install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [2/2] Building for production...
call npm.cmd run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your app is ready to deploy!
echo.
echo Built files are in the 'dist' folder.
echo.
echo Next steps:
echo 1. Go to https://www.netlify.com
echo 2. Drag and drop the 'dist' folder
echo 3. Your app will be live!
echo.
echo OR use Vercel:
echo 1. Go to https://vercel.com
echo 2. Import your project
echo 3. Deploy!
echo.
echo See DEPLOY.md for more options.
echo.
pause

