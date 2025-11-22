# 🚀 How to Run the IPO Analyzer App

## Quick Start (Easiest Method)

### Option 1: Demo Mode (No Backend Needed)

**Double-click or run:**
```batch
run-app.bat
```

This will:
- ✅ Check for Node.js
- ✅ Install dependencies (if needed)
- ✅ Start the app in **demo mode** with mock data
- ✅ Open at `http://localhost:5173`

### Option 2: Production Mode (With Live Data)

**Double-click or run:**
```batch
start-production.bat
```

This will:
- ✅ Set up both frontend and backend
- ✅ Install all dependencies
- ✅ Start backend server (port 3000)
- ✅ Start frontend server (port 5173)
- ✅ Fetch **real live GMP data** from IPO websites

---

## Manual Method (Step by Step)

### For Demo Mode:

1. **Open terminal/PowerShell** in the project folder:
   ```powershell
   cd "C:\Users\Admin\OneDrive\Desktop\RVCE25BCS817\IPO"
   ```

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start the app**:
   ```bash
   npm run dev
   ```

4. **Open browser** and go to: `http://localhost:5173`

### For Production Mode:

1. **Start Backend** (Terminal 1):
   ```bash
   cd server
   npm install
   npm start
   ```
   Backend runs on `http://localhost:3000`

2. **Start Frontend** (Terminal 2 - new terminal):
   ```bash
   # In the root directory
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Configure** (if needed):
   - Create `.env` file in root with:
     ```
     VITE_APP_MODE=production
     VITE_API_BASE_URL=http://localhost:3000/api
     ```

---

## What You'll See

### Demo Mode:
- ⚠️ Yellow badge: "Demo Mode - Using Mock Data"
- Uses realistic mock data for testing
- No backend required

### Production Mode:
- ✅ Green badge: "Production Mode - Using Real API"
- Fetches live GMP data from IPO websites
- Requires backend server running

---

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Run `fix-nodejs-path.bat` to add Node.js to PATH
- Or restart your terminal after installing Node.js

### Port already in use
- Vite will automatically use the next available port
- Or stop other servers using port 5173

### Backend won't start
- Make sure you're in the `server` directory
- Run `npm install` in the server directory first
- Check if port 3000 is available

### App doesn't load
- Check if the dev server is running
- Look for the URL in the terminal (usually `http://localhost:5173`)
- Make sure no firewall is blocking the connection

---

## Available Scripts

- `npm run dev` - Start development server (demo mode)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## Quick Reference

| Mode | Script | Backend Needed | Data Source |
|------|--------|----------------|-------------|
| Demo | `run-app.bat` | ❌ No | Mock data |
| Production | `start-production.bat` | ✅ Yes | Live web scraping |

---

## Need Help?

- See `README.md` for detailed documentation
- See `PRODUCTION_SETUP.md` for production setup
- Check terminal output for error messages

