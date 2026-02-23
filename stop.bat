@echo off
echo ========================================
echo   Uptime Monitor - Stop Services
echo ========================================
echo.

docker-compose down

echo.
echo All services stopped!
echo.
pause
