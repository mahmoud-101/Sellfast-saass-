@echo off
echo ========================================
echo   Deploying to Vercel via GitHub...
echo ========================================
git add .
git commit -m "feat: Perplexity primary engine + image diversity fix + type cleanup"
git push origin main
echo ========================================
echo   Done! Check Vercel for build status.
echo ========================================
pause
