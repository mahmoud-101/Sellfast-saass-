@echo off
echo Pushing updates...
git add .
git commit -m "feat: Connect Gemini AI to PerformancePanel via PromptBuilder & ResponseAnalyzer"
git push origin main
echo Done!
pause
