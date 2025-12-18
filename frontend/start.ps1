# Quick Start Script for Windows PowerShell
# Run this script to set up and start the development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Local Language Learning App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed." -ForegroundColor Green
    $install = Read-Host "Reinstall dependencies? (y/N)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
}
else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take 2-3 minutes..." -ForegroundColor Gray
    npm install
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "The app will open automatically in your browser." -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev
