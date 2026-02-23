#!/bin/bash

echo "========================================"
echo "  Uptime Monitor - Quick Start"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/5] Checking environment file..."
if [ ! -f .env ]; then
    echo "[WARNING] .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "[ACTION REQUIRED] Please edit .env file and set:"
    echo "  - JWT_SECRET to a secure random string"
    echo "  - MONGO_ROOT_PASSWORD to a secure password"
    echo ""
    read -p "Press Enter when ready..."
fi

echo ""
echo "[2/5] Stopping existing containers..."
docker-compose down

echo ""
echo "[3/5] Building Docker images..."
docker-compose build

echo ""
echo "[4/5] Starting containers..."
docker-compose up -d

echo ""
echo "[5/5] Waiting for services to be ready..."
sleep 10

echo ""
echo "========================================"
echo "  Application is running!"
echo "========================================"
echo ""
echo "Frontend:  http://localhost"
echo "Backend:   http://localhost:5000"
echo ""
echo "Checking container status..."
docker-compose ps
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop all:  docker-compose down"
echo ""
