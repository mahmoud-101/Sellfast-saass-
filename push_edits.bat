@echo off
echo ===================================================
echo   Sellfast AI - UX Polish Batch 1: Easy Wins
echo ===================================================
echo.
echo Changes in this batch:
echo  [FIX] Translated Hub titles to Arabic:
echo        "Market Intelligence Hub" → "مركز ذكاء السوق"
echo        "Campaign Builder Hub"    → "مصنع الحملات الإعلانية"
echo        "Creative Studio Hub"     → "الاستوديو الإبداعي المرئي"
echo  [FIX] Translated "Advanced Tools" → "أدوات الخبراء" (all 3 hubs)
echo  [FIX] PricingModal: Plans now show what credits actually buy
echo        e.g. "10 حملات كاملة + 40 صورة" instead of "1200 نقطة"
echo  [FIX] Plan names fully in Arabic (removed English in parentheses)
echo  [FIX] Market Intelligence: Product Analysis as PRIMARY output
echo  [FIX] [object Object] bug fully resolved in trends display
echo  [+]   All previous fixes (sessionStorage, image compression, etc.)
echo.
cd /d "%~dp0"
git add .
git commit -m "ux: arabic translations + credits clarity + product analysis primary"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel is building...
    echo Check in 2-3 minutes.
) else (
    echo Error during push.
)
echo ===================================================
pause
