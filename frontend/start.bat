@echo off
echo Starting Uptime Tool Frontend...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo The frontend will be available at http://localhost:3000
echo Make sure the backend is running on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
pause