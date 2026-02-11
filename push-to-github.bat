@echo off
echo ========================================
echo Pushing Backend to GitHub Repository
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo Error: Git initialization failed
    pause
    exit /b 1
)

echo.
echo Step 2: Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Niranjanprakash/aitechpulze-backend.git
if errorlevel 1 (
    echo Error: Failed to add remote repository
    pause
    exit /b 1
)

echo.
echo Step 3: Adding all files...
git add .
if errorlevel 1 (
    echo Error: Failed to add files
    pause
    exit /b 1
)

echo.
echo Step 4: Creating commit...
git commit -m "Initial commit: AI Tech Pulze Backend"
if errorlevel 1 (
    echo Error: Failed to create commit
    pause
    exit /b 1
)

echo.
echo Step 5: Setting branch to main...
git branch -M main

echo.
echo Step 6: Pushing to GitHub...
git push -u origin main --force
if errorlevel 1 (
    echo Error: Failed to push to GitHub
    echo Please check your GitHub credentials and repository access
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Backend pushed to GitHub
echo Repository: https://github.com/Niranjanprakash/aitechpulze-backend
echo ========================================
pause
