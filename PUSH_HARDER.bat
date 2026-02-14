@echo off
echo ===================================================
echo   Ebdaa Pro - EMERGENCY PUSH v3.0
echo ===================================================
echo.

echo 1. Cleaning git lock files (just in case)...
if exist .git\index.lock del .git\index.lock

echo 2. Adding ALL files...
git add .
if %errorlevel% neq 0 goto ERROR

echo 3. Committing...
git commit -m "Emergency Fix: Force UI Update v2.0"
:: Commit might fail if nothing to commit, that's ok
if %errorlevel% neq 0 echo [INFO] Nothing new to commit or commit failed.

echo 4. Pushing to origin/main (FORCE)...
git push origin main --force > push_log.txt 2>&1

if %errorlevel% neq 0 goto ERROR

echo.
echo ===================================================
echo   SUCCESS! Codes pushed successfully.
echo   Check 'push_log.txt' if you want details.
echo   Wait 2 minutes and refresh the site.
echo ===================================================
pause
exit /b 0

:ERROR
echo.
echo ===================================================
echo   FATAL ERROR: The push failed.
echo   Check your internet or git permissions.
echo   See push_log.txt for details.
echo ===================================================
pause
exit /b 1
