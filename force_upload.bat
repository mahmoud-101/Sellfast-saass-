@echo off
echo ===================================================
echo   Ebdaa Pro - Force Update Script v3.0 (Fix Build)
echo ===================================================
echo.
echo 1. Ensuring package-lock.json is tracked...
git add package-lock.json --force
if %errorlevel% neq 0 echo [WARN] Failed to add package-lock.json, checking if it exists...

echo 2. Adding all other files...
git add .

echo 3. Committing changes...
git commit -m "Fix: Add package-lock.json for npm ci compliance"
if %errorlevel% neq 0 echo [INFO] Commit might be empty, continuing...

echo 4. Pushing to server (FORCE)...
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
