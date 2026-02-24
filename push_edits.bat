@echo off
echo ===================================================
echo   Sellfast AI - Full Audit + Priority Restructure
echo ===================================================
echo.
echo Changes in this batch:
echo  [FIX] Market Intelligence: Product Analysis is now PRIMARY output
echo        Displayed as rich cards: Audience, USP, Positioning,
echo        Pricing, Advantages, Sales Angles, and Video Hook
echo  [FIX] Trends demoted to collapsible secondary section
echo  [FIX] [object Object] bug fully resolved
echo  [FIX] Orchestrator upgraded: runs analysis + trends in parallel
echo  [FIX] Strategy summary textarea now filled from productAnalysis
echo  [OK]  CampaignBuilderHub output rendering verified correct
echo  [OK]  CreativeStudio storyboard schema verified correct (all strings)
echo  [+]   sessionStorage state persistence
echo  [+]   Image compression (PhotoshootDirector)
echo  [+]   Supabase campaigns table + save function
echo  [+]   Animated loading messages (all 3 hubs)
echo.
cd /d "%~dp0"
git add .
git commit -m "feat: product analysis as primary output + full hub audit + [object Object] fix"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel is building...
    echo Check again in 2-3 minutes.
) else (
    echo Error during push. Check message above.
)
echo ===================================================
pause
