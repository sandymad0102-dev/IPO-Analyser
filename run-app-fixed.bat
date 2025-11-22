@echo off
REM IPO Analyzer - Run Script (Fixed for portable Node.js)
echo ========================================
echo IPO Analyzer - Starting Application
echo ========================================
echo.

REM Add Node.js to PATH for this session if found
if exist "C:\node-v24.11.1-win-x64\node.exe" (
    set "PATH=C:\node-v24.11.1-win-x64;%PATH%"
    echo [INFO] Using Node.js from C:\node-v24.11.1-win-x64
)

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Node.js should be at: C:\node-v24.11.1-win-x64
    echo If it's in a different location, please update this script.
    echo.
    echo To add Node.js to PATH permanently, run: fix-nodejs-path.bat
    pause
    exit /b 1
)

node --version
npm.cmd --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm.cmd install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed!
    echo.
) else (
    echo [SUCCESS] Dependencies already installed
    echo.
)

REM Start the development server
echo Starting development server...
echo The app will be available at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
call npm.cmd run dev

pause

