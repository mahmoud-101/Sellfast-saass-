@echo off
echo.
echo ==========================================
echo   SELLFAST - Fix Git + Push to Vercel
echo ==========================================
echo.

cd /d C:\Users\DELL\Desktop\Sellfast-saass--main

echo [1/6] Fixing broken git reference...
del .git\refs\heads\main 2>nul

echo [2/6] Resetting git...
git init

echo [3/6] Setting remote...
git remote remove origin 2>nul
git remote add origin https://github.com/mahmoud-101/Sellfast-saass-.git

echo [4/6] Adding all files...
git add -A

echo [5/6] Committing...
git commit -m "fix: k.slice error in Pro Mode & JSON response analyzer"

echo [6/6] Pushing to GitHub (force)...
git push origin main --force

echo.
echo ==========================================
echo   DONE! Vercel will auto-build now.
echo   Check: https://vercel.com/dashboard
echo ==========================================
pause
