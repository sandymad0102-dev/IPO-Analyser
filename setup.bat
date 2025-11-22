@echo off
REM IPO Analyzer Setup Script for Windows
REM Run this script after installing Node.js

echo ========================================
echo IPO Analyzer - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installing, close and reopen this terminal, then run this script again.
    echo.
    pause
    exit /b 1
)

node --version
npm --version
echo.

REM Install dependencies
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully!
echo.

REM Ask if user wants to start the dev server
echo Setup complete!
echo.
set /p startServer="Do you want to start the development server now? (y/n): "
if /i "%startServer%"=="y" (
    echo.
    echo Starting development server...
    echo The app will open at http://localhost:5173
    echo Press Ctrl+C to stop the server
    echo.
    call npm run dev
) else (
    echo.
    echo To start the app later, run: npm run dev
    echo.
)

pause

