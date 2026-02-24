@echo off
echo ===================================================
echo   Sellfast AI - UX Polish Batch 3: Progress Steps
echo ===================================================
echo.
echo Changes in this batch:
echo  [+] NEW AIProgressSteps component - replaces generic spinner
echo       Blue  - مركز ذكاء السوق (5 named steps)
echo       Purple - مصنع الحملات (4 named steps)
echo       Green  - الاستوديو الإبداعي (4 named steps)
echo       Includes: live progress bar, step icons, bouncing dots
echo.
echo  [+] Onboarding 3-step guide (shows once per device)
echo  [FIX] Hub titles fully translated to Arabic
echo  [FIX] Pricing plans show real deliverables
echo  [FIX] Product Analysis as primary output
echo  [FIX] [object Object] trends bug resolved
echo.
cd /d "%~dp0"
git add .
git commit -m "ux: ai progress steps + onboarding + arabic titles + credits clarity"
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Vercel deploying...
    echo Users will now see step-by-step progress instead of a generic spinner!
) else (
    echo Error - check above.
)
echo ===================================================
pause
