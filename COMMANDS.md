# 🚀 Quick Commands Reference

## Essential Commands

### First Time Setup

```powershell
# Enable script execution (if needed)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Navigate to project
cd "c:\Users\DELL\Desktop\LLAi project"

# Install dependencies
npm install
```

### Development

```powershell
# Start development server
npm run dev

# Or use the quick start script
.\start.ps1
```

### Production

```powershell
# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting Commands

### Clear and Reinstall

```powershell
# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

### Check Versions

```powershell
node --version
npm --version
```

### Port Issues

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## Git Commands (for version control)

```powershell
# Initialize git (first time)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete frontend"

# Add remote repository
git remote add origin <your-repo-url>

# Push to GitHub
git push -u origin main
```

## File Navigation

```powershell
# Open VS Code
code .

# Open in File Explorer
explorer .

# List files
Get-ChildItem

# Navigate to component
cd src/components/dashboard
```

## Useful PowerShell Commands

```powershell
# Check if port is in use
Test-NetConnection -ComputerName localhost -Port 3000

# Get PowerShell version
$PSVersionTable.PSVersion

# List running node processes
Get-Process node
```

## Quick Edits

```powershell
# Edit a specific file
notepad src/App.jsx

# Or use VS Code
code src/App.jsx
```

## Package Management

```powershell
# Add new package
npm install package-name

# Remove package
npm uninstall package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated
```

## Project Commands

```powershell
# View installed packages
npm list --depth=0

# Run security audit
npm audit

# Fix security issues
npm audit fix
```

## Opening Documentation

```powershell
# View README
code README.md

# View setup guide
code SETUP_GUIDE.md

# View curriculum
code docs/SYLLABUS_STRUCTURE.md

# View checklist
code CHECKLIST.md

# View summary
code PROJECT_SUMMARY.md
```

## Browser Commands

```powershell
# Open in default browser
start http://localhost:3000

# Open in specific browser
start chrome http://localhost:3000
start msedge http://localhost:3000
start firefox http://localhost:3000
```

## Development Server Info

When running `npm run dev`, you'll see:

- **Local:** http://localhost:3000
- **Network:** http://192.168.x.x:3000 (for mobile testing)

Press:

- **h** - Show help
- **o** - Open in browser
- **q** - Quit server
- **Ctrl+C** - Force quit

## Component Locations

```powershell
# Landing page components
cd src/components/landing

# Dashboard components
cd src/components/dashboard

# Pages
cd src/pages

# Styles
cd src/styles

# Data
cd src/data
```

## Quick Tests

```powershell
# Test if server is running
Invoke-WebRequest -Uri http://localhost:3000

# Check if dependencies are installed
Test-Path node_modules
```

## Backup Commands

```powershell
# Create backup
Compress-Archive -Path * -DestinationPath "../LLAi-backup-$(Get-Date -Format 'yyyyMMdd').zip"

# List backups
Get-ChildItem ../*.zip
```

## Performance Commands

```powershell
# Check disk space
Get-PSDrive C

# Check memory usage
Get-Process node | Select-Object Name, PM

# Monitor CPU usage
Get-Counter '\Processor(_Total)\% Processor Time'
```

## Deployment Commands

```powershell
# Build and compress for deployment
npm run build
Compress-Archive -Path dist/* -DestinationPath deploy.zip
```

## Environment Management

```powershell
# Create .env file
New-Item .env

# Edit .env
notepad .env

# Example .env content:
# VITE_API_URL=http://localhost:5000
# VITE_APP_NAME=LocalLearn
```

## Helpful Aliases (add to PowerShell profile)

```powershell
# Edit PowerShell profile
notepad $PROFILE

# Add these aliases:
function dev { npm run dev }
function build { npm run build }
function preview { npm run preview }
function app { cd "c:\Users\DELL\Desktop\LLAi project" }
```

## Quick File Creation

```powershell
# Create new component
New-Item src/components/NewComponent.jsx
New-Item src/components/NewComponent.css
```

## Logs and Debugging

```powershell
# View npm logs
npm run dev > debug.log 2>&1

# Tail logs (requires PowerShell 7+)
Get-Content debug.log -Wait

# Clear console
Clear-Host
# or
cls
```

---

## 📌 Most Used Commands

```powershell
# Start developing
npm run dev

# Install packages
npm install

# Build for production
npm run build
```

## 🆘 Emergency Commands

```powershell
# Something broke? Reset everything:
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
npm run dev
```

---

**Save this file for quick reference!** 📚
