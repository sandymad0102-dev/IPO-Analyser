@echo off
REM IPO Analyzer - Run Script
echo ========================================
echo IPO Analyzer - Starting Application
echo ========================================
echo.

REM Check for Node.js in PATH
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Try to find Node.js in common locations
    if exist "C:\node-v24.11.1-win-x64\node.exe" (
        set "PATH=C:\node-v24.11.1-win-x64;%PATH%"
        echo [INFO] Found Node.js at C:\node-v24.11.1-win-x64
    ) else if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        echo [INFO] Found Node.js at C:\Program Files\nodejs
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
        echo [INFO] Found Node.js at %LOCALAPPDATA%\Programs\nodejs
    ) else (
        echo [ERROR] Node.js not found!
        echo Please install Node.js from https://nodejs.org/
        echo Or add Node.js to your system PATH.
        pause
        exit /b 1
    )
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

