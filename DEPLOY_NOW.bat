@echo off
echo ========================================
echo   Fixing leaked API key + Deploying...
echo ========================================

echo.
echo [1/4] Removing .env from git tracking...
git rm --cached .env 2>nul
if errorlevel 1 echo .env was not tracked, skipping...

echo.
echo [2/4] Adding all changes...
git add .

echo.
echo [3/4] Committing...
git commit -m "security: remove leaked API key, switch to Perplexity primary engine, add type fixes"

echo.
echo [4/4] Pushing to GitHub (triggers Vercel deploy)...
git push origin main

echo.
echo ========================================
echo   DONE! Now go to Vercel Dashboard and
echo   add VITE_GEMINI_API_KEY there ONLY.
echo ========================================
pause
