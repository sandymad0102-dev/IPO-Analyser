# Production Setup Guide

This guide will help you set up the IPO Analyzer app to run with **live data** instead of demo mode.

## Prerequisites

- Node.js installed (v16 or higher)
- Internet connection (for fetching live GMP data)

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```batch
.\start-production.bat
```

**PowerShell:**
```powershell
.\start-production.ps1
```

This script will:
1. Install all dependencies (frontend + backend)
2. Set up environment files
3. Start both backend and frontend servers

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `axios` - HTTP client for web scraping
- `cheerio` - HTML parsing (like jQuery for server)

#### Step 2: Configure Backend

Create `server/.env` file:
```bash
cd server
copy .env.production .env
```

Or create manually:
```
PORT=3000
# Optional: ANTHROPIC_API_KEY=your-key-here
```

#### Step 3: Configure Frontend

Create `.env` file in root directory:
```bash
copy .env.production .env
```

Or create manually:
```
VITE_APP_MODE=production
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Step 4: Start Backend Server

```bash
cd server
npm start
```

The backend will run on `http://localhost:3000`

#### Step 5: Start Frontend (in a new terminal)

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## How It Works

### Data Sources

The app fetches live GMP data from multiple sources:

1. **Primary**: Web scraping from:
   - InvestorGain.com
   - Chittorgarh.com
   - Other IPO data sources

2. **Optional**: Anthropic API (if API key is configured)
   - More accurate but requires API key
   - Falls back to web scraping if not configured

### Backend API

The backend provides a REST API endpoint:

**POST** `/api/gmp-data`
```json
{
  "company": "Swiggy"
}
```

**Response:**
```json
{
  "gmp": 45,
  "issuePrice": "390",
  "priceRange": "380-390",
  "issueSize": "11,327 Cr",
  "subscriptionStatus": "open",
  "allotmentDate": "18 Nov 2025",
  "refundDate": "19 Nov 2025",
  "listingDate": "20 Nov 2025",
  "lastUpdated": "17 Nov 2025",
  "source": "InvestorGain.com (Live Data)"
}
```

## Optional: Anthropic API Setup

For enhanced data accuracy, you can configure Anthropic API:

1. Get API key from: https://console.anthropic.com/
2. Add to `server/.env`:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```
3. Install Anthropic SDK (already in devDependencies):
   ```bash
   cd server
   npm install @anthropic-ai/sdk
   ```

The backend will use Anthropic API as primary source and fall back to web scraping if it fails.

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `server/node_modules` exists (run `npm install` in server directory)
- Check `server/.env` file exists

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check `VITE_API_BASE_URL` in `.env` matches backend URL
- Verify CORS is enabled (already configured in server.js)

### No data returned
- Check internet connection
- Verify company name spelling
- Some IPOs may not have GMP data available yet
- Check browser console for errors

### Web scraping blocked
- Some websites may block automated requests
- Try using Anthropic API as alternative
- Check server logs for specific errors

## Production Deployment

For production deployment:

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Deploy backend:**
   - Use a Node.js hosting service (Heroku, Railway, Render, etc.)
   - Set environment variables
   - Update `VITE_API_BASE_URL` to your backend URL

3. **Deploy frontend:**
   - Use static hosting (Netlify, Vercel, etc.)
   - Set `VITE_APP_MODE=production`
   - Set `VITE_API_BASE_URL` to your backend URL

## Security Notes

- Never commit `.env` files to version control
- Keep API keys secure
- Use HTTPS in production
- Consider rate limiting for API endpoints
- Add authentication if exposing publicly

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Test backend API directly: `curl -X POST http://localhost:3000/api/gmp-data -H "Content-Type: application/json" -d '{"company":"Swiggy"}'`

