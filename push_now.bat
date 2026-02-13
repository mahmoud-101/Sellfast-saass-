@echo off
echo Starting Push to GitHub...
echo.
git push -u origin main --force
echo.
echo ==============================================
echo If you see "Everything up-to-date", it worked!
echo If it asks for login, please sign in.
echo ==============================================
pause
