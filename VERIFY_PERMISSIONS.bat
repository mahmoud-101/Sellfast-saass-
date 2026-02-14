@echo off
echo ==========================================
echo        VERIFYING SYSTEM PERMISSIONS
echo ==========================================
echo.
echo 1. Checking Windows Version...
ver
if %errorlevel% neq 0 echo [FAIL] Windows command blocked!
if %errorlevel% equ 0 echo [PASS] Windows command working.
echo.

echo 2. Checking Git...
git --version
if %errorlevel% neq 0 echo [FAIL] Git blocked or not installed!
if %errorlevel% equ 0 echo [PASS] Git working.
echo.

echo 3. Checking Node.js...
node --version
if %errorlevel% neq 0 echo [FAIL] Node.js blocked or not installed!
if %errorlevel% equ 0 echo [PASS] Node.js working.
echo.

echo 4. Checking NPM...
npm --version
if %errorlevel% neq 0 echo [FAIL] NPM blocked or not installed!
if %errorlevel% equ 0 echo [PASS] NPM working.
echo.

echo ==========================================
echo If you see [FAIL], run this script as Administrator.
echo If everything is [PASS], try running the Agent as Administrator.
echo ==========================================
pause
