@echo off
REM This script adds Node.js to PATH permanently
echo ========================================
echo Node.js PATH Configuration
echo ========================================
echo.

REM Check if Node.js exists at the portable location
if exist "C:\node-v24.11.1-win-x64\node.exe" (
    echo Found Node.js at: C:\node-v24.11.1-win-x64
    echo.
    echo Adding to system PATH permanently...
    
    REM Add to user PATH
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"
    echo %USER_PATH% | findstr /C:"C:\node-v24.11.1-win-x64" >nul
    if %ERRORLEVEL% NEQ 0 (
        setx PATH "%USER_PATH%;C:\node-v24.11.1-win-x64" >nul
        echo [SUCCESS] Added Node.js to PATH!
        echo.
        echo IMPORTANT: Close and reopen your terminal for changes to take effect.
    ) else (
        echo [INFO] Node.js is already in PATH
    )
) else (
    echo [ERROR] Node.js not found at C:\node-v24.11.1-win-x64
    echo Please verify your Node.js installation location.
)

echo.
pause

