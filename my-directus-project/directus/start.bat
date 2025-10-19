@echo off
REM Directus Startup Script for Windows

echo Starting Directus CMS...

REM Check if .env exists
if not exist .env (
    echo .env file not found!
    echo Please create a .env file based on the example in SETUP.md
    exit /b 1
)

REM Start Docker containers
echo Starting Docker containers...
docker-compose up -d

REM Wait for services to start
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

REM Check container status
echo Container status:
docker-compose ps

echo.
echo Directus is starting up!
echo Admin Panel: http://localhost:8055
echo Check logs with: docker-compose logs -f
echo.

