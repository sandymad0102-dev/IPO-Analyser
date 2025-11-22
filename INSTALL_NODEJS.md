# Installing Node.js - Quick Guide

## Step 1: Download Node.js

1. Go to: **https://nodejs.org/**
2. Download the **LTS (Long Term Support)** version (recommended)
3. Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

## Step 2: Install Node.js

1. Run the downloaded installer
2. Follow the installation wizard:
   - Click "Next" through the setup
   - Accept the license agreement
   - Choose installation location (default is fine)
   - **IMPORTANT**: Make sure "Add to PATH" is checked (should be by default)
   - Click "Install"
3. Wait for installation to complete
4. Click "Finish"

## Step 3: Verify Installation

1. **Close and reopen your terminal/PowerShell** (important!)
2. Run these commands to verify:
   ```bash
   node --version
   npm --version
   ```
3. You should see version numbers (e.g., v20.10.0 and 10.2.3)

## Step 4: Run the App

Once Node.js is installed, come back to this directory and run:

```bash
npm install
npm run dev
```

## Alternative: Using Chocolatey (if you have it)

If you have Chocolatey package manager installed:
```bash
choco install nodejs-lts
```

## Troubleshooting

### "node is not recognized" after installation
- **Close and reopen your terminal/PowerShell** - this is the most common issue
- Restart your computer if that doesn't work
- Check if Node.js is installed: Go to `C:\Program Files\nodejs\` and see if `node.exe` exists
- If it exists but still not recognized, you may need to add it to PATH manually

### Adding to PATH manually (if needed)
1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System variables", find "Path" and click "Edit"
4. Click "New" and add: `C:\Program Files\nodejs\`
5. Click OK on all dialogs
6. Restart your terminal

