# Quick Start - After Installing Node.js

## ⚠️ IMPORTANT: Restart Your Terminal

After installing Node.js, you **MUST** close and reopen your terminal for it to work.

## Steps to Run the App

1. **Close this terminal completely** (close the window)

2. **Open a NEW terminal/PowerShell window**

3. **Navigate to the project directory:**
   ```powershell
   cd "C:\Users\Admin\OneDrive\Desktop\RVCE25BCS817\IPO"
   ```

4. **Verify Node.js is installed:**
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.10.0 and 10.2.3)

5. **Install dependencies:**
   ```powershell
   npm install
   ```
   This will take a minute or two to download all packages.

6. **Start the development server:**
   ```powershell
   npm run dev
   ```

7. **Open your browser** and go to the URL shown (usually `http://localhost:5173`)

## Alternative: Use the Setup Script

After restarting your terminal, you can also run:
```powershell
.\setup.bat
```

This will automatically check for Node.js, install dependencies, and optionally start the server.

## Troubleshooting

### "node is not recognized"
- Make sure you **closed and reopened** the terminal after installing Node.js
- Restart your computer if that doesn't work
- Verify Node.js installation: Check if `C:\Program Files\nodejs\` exists

### "npm is not recognized"
- Same as above - restart your terminal
- npm comes with Node.js, so if node works, npm should too

### Port already in use
- Vite will automatically use the next available port
- Or stop any other servers running on port 5173

