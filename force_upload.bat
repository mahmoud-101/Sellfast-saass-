@echo off
echo ===================================================
echo   Ebdaa Pro - Force Update Script v2.0
echo ===================================================
echo.
echo 1. Adding all files...
git add .
if %errorlevel% neq 0 echo [WARN] Git add failed.

echo 2. Committing changes...
git commit -m "Update Design to V2 (Aurora & Glassmorphism)"
if %errorlevel% neq 0 echo [INFO] Commit might be empty, continuing...

echo 3. Pushing to server (FORCE)...
echo This might take a few seconds...
git push -u origin main --force

echo.
echo ===================================================
if %errorlevel% equ 0 (
    echo   SUCCESS! Deployment triggered.
    echo   Please wait 2-3 minutes for the site to update.
    echo ===================================================
) else (
    echo   ERROR: Upload failed.
    echo   Please check your internet connection.
    echo ===================================================
)
pause
