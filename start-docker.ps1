#!/usr/bin/env pwsh
# Lulimi Lingo Docker Quick Start Script

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker daemon is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker daemon is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop"
    exit 1
}

Write-Host "`n🚀 Starting Lulimi Lingo containers...`n" -ForegroundColor Cyan

# Build and start all containers
docker-compose up --build

Write-Host "`n✓ Containers are now running!" -ForegroundColor Green
Write-Host "`nAccess the application at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "MongoDB: localhost:27017" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop containers" -ForegroundColor White
