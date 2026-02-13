@echo off
echo Setting remote repository URL...
git remote add origin https://github.com/mahmoud-101/Sellfast-saass-.git 2>nul
git remote set-url origin https://github.com/mahmoud-101/Sellfast-saass-.git

echo Adding App.tsx...
git add App.tsx >> push_log.txt 2>&1

echo Committing changes...
git commit -m "Fix App.tsx structure and restore studio functionality" >> push_log.txt 2>&1

echo Pushing to GitHub...
echo. >> push_log.txt
echo "--- NEW PUSH ATTEMPT ---" >> push_log.txt
git push origin main >> push_log.txt 2>&1

echo.
echo ==========================================
echo If there are errors, they are saved in push_log.txt
echo ==========================================
echo Done!
pause
