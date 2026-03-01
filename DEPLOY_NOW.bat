@echo off
echo.
echo ==========================================
echo   SELLFAST DEPLOY - Security Fix + Push
echo ==========================================
echo.

echo [1/5] Removing .env from git tracking...
git rm --cached .env 2>nul
git rm --cached .env.local 2>nul

echo [2/5] Removing deploy scripts from tracking...
git rm --cached DEPLOY_NOW.bat 2>nul
git rm --cached push_edits.bat 2>nul

echo [3/5] Staging all changes...
git add -A

echo [4/5] Committing...
git commit -m "security: permanent API key fix - remove .env from tracking, Perplexity primary engine, leaked-key auto-detection"

echo [5/5] Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo   DONE! Check Vercel for build status.
echo.
echo   IMPORTANT: Add these in Vercel Dashboard
echo   Settings -^> Environment Variables:
echo.
echo   VITE_GEMINI_API_KEY = (new key from Google AI Studio)
echo   VITE_PERPLEXITY_API_KEY = pplx-Oei3N1...
echo   VITE_SUPABASE_URL = https://xxx.supabase.co
echo   VITE_SUPABASE_ANON_KEY = eyJhbG...
echo ==========================================
pause
