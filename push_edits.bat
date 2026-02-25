@echo off
echo Pushing updates...
git add .
git commit -m "Fix: Add html2canvas to package.json for Vercel build + Phase 8+9 Performance Engine"
git push origin main
echo Done!
pause
