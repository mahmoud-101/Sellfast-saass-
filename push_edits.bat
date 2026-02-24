@echo off
echo ===================================================
echo   Sellfast AI - Deploying Editable Hubs Feature
echo ===================================================
echo.
echo Pushing local changes to GitHub to trigger Vercel deploy...
echo.

cd /d "%~dp0"
git add .
git commit -m "feat: added fully editable text areas to Market Intelligence, Campaign Builder, and Creative Studio Hubs"
git push origin main

echo.
echo If you see no errors above, the push was successful!
echo Vercel will now build and deploy the changes in a few minutes.
echo ===================================================
pause
