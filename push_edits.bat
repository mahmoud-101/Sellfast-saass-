@echo off
echo 🚀 Starting Deployment Process...
git add .
git commit -m "Implement ProductionFactoryHub and Storyboard image auto-generation"
git push origin main
echo ✅ Deployment Complete!
pause
