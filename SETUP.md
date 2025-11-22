# Quick Setup Guide

## Step 1: Install Node.js

If you don't have Node.js installed:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Install it
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Frontend Dependencies

```bash
npm install
```

## Step 3: Run in Demo Mode (Default)

```bash
npm run dev
```

The app will run with mock data - no backend needed!

## Step 4: Set Up Production Mode (Optional)

### A. Backend Server Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your-actual-api-key-here
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### B. Frontend Configuration

1. In the root directory, create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   ```
   VITE_APP_MODE=production
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. Restart the frontend:
   ```bash
   npm run dev
   ```

## Troubleshooting

### npm command not found
- Make sure Node.js is installed
- Restart your terminal after installing Node.js
- Check if Node.js is in your PATH

### Port already in use
- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will automatically use the next available port

### API connection errors
- Make sure backend server is running
- Check `VITE_API_BASE_URL` matches your backend URL
- Verify CORS is enabled on backend (already configured in server.js)

