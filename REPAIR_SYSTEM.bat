@echo off
echo ==========================================
echo      REPAIRING SELLFAST SYSTEM ENVIRONMENT
echo ==========================================
echo.
echo 1. Cleaning NPM Cache...
call npm cache clean --force
echo.

echo 2. Removing old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.

echo 3. Reinstalling dependencies (This may take a few minutes)...
call npm install
echo.

echo ==========================================
if %errorlevel% neq 0 (
    echo [ERROR] The repair failed.
    echo Please download and reinstall Node.js from: https://nodejs.org/
) else (
    echo [SUCCESS] System repaired! 
    echo Now try running "npm run dev" or the upload script again.
)
echo ==========================================
pause
