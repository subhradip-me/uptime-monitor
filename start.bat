@echo off
echo ========================================
echo   Uptime Monitor - Quick Start
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Checking environment file...
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit .env file and set:
    echo   - JWT_SECRET to a secure random string
    echo   - MONGO_ROOT_PASSWORD to a secure password
    echo.
    echo Press any key when ready...
    pause >nul
)

echo.
echo [2/5] Stopping existing containers...
docker-compose down

echo.
echo [3/5] Building Docker images...
docker-compose build

echo.
echo [4/5] Starting containers...
docker-compose up -d

echo.
echo [5/5] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Application is starting!
echo ========================================
echo.
echo Frontend:  http://localhost
echo Backend:   http://localhost:5000
echo.
echo Checking container status...
docker-compose ps
echo.
echo View logs: docker-compose logs -f
echo Stop all:  docker-compose down
echo.
pause
