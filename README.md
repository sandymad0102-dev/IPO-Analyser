# IPO Analyzer

A React-based web application for analyzing IPOs with Grey Market Premium (GMP) data and DRHP insights.

## Features

- **Live GMP Analysis**: Fetch and analyze Grey Market Premium data for IPOs
- **DRHP Insights**: Analyze company fundamentals from DRHP documents
- **Investment Recommendations**: Get AI-powered verdicts (APPLY/CAUTION/AVOID)
- **Important Dates Tracking**: View allotment, refund, and listing dates
- **Real-time Updates**: Refresh GMP data on demand

## Current Status

✅ **Production Ready**: The app now supports **live data fetching** with web scraping!

- **Demo Mode** (default): Uses mock data for testing
- **Production Mode**: Fetches real GMP data from IPO websites using web scraping
- **Optional**: Anthropic API integration for enhanced accuracy

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for complete setup instructions.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

**Prerequisites:** Node.js must be installed. If you see "npm is not recognized", see [INSTALL_NODEJS.md](./INSTALL_NODEJS.md) for installation instructions.

**Quick Start (Demo Mode):**

**Option 1: Using Setup Script (Recommended for Windows)**
```bash
# Run the setup script
.\setup.bat
# or
.\setup.ps1
```

**Option 2: Manual Setup**
1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

**Note:** If `npm` command is not found, install Node.js from https://nodejs.org/ first. See [INSTALL_NODEJS.md](./INSTALL_NODEJS.md) for detailed instructions.

For detailed setup instructions including production mode, see [SETUP.md](./SETUP.md).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Enter the company name (e.g., "Swiggy", "Hyundai Motor India", "NTPC Green Energy")
2. The issue price will be auto-filled when GMP data is fetched (or enter manually)
3. Optionally upload a DRHP PDF file
4. Click "Analyze IPO with Live GMP" to get the analysis
5. Review the verdict, GMP data, DRHP analysis, and important dates

## Demo Mode

The app currently uses mock data that varies based on the company name:
- **Swiggy/Zomato**: High GMP (45), large issue size
- **Hyundai Motor**: Moderate GMP (28), very large issue size
- **NTPC Green Energy**: Lower GMP (12), medium issue size
- **Other companies**: Random realistic values

## Production Setup

### Quick Start (Automated) ⚡

**Windows:**
```batch
.\start-production.bat
```

**PowerShell:**
```powershell
.\start-production.ps1
```

This automatically installs dependencies, sets up environment files, and starts both servers!

### Manual Setup

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Create backend `.env` file:**
   ```bash
   cd server
   # Create .env file with: PORT=3000
   # See server/env-production-template.txt for reference
   ```

3. **Start backend server:**
   ```bash
   cd server
   npm start
   ```
   Backend runs on `http://localhost:3000`

4. **Configure frontend:**
   - Create `.env` file in root directory with:
     ```
     VITE_APP_MODE=production
     VITE_API_BASE_URL=http://localhost:3000/api
     ```
   - See `env-production-template.txt` for reference

5. **Start frontend (in new terminal):**
   ```bash
   npm run dev
   ```

### How It Works

- **Web Scraping**: Fetches live GMP data from InvestorGain.com, Chittorgarh.com, and other IPO websites
- **Multiple Sources**: Tries multiple sources for reliability
- **Optional Anthropic API**: Can be configured for enhanced accuracy (requires API key)

📖 **For complete details, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)**

### Option 2: Custom Backend

1. Set up your own backend server that:
   - Handles API authentication securely
   - Calls external APIs (Anthropic, web scraping services, etc.)
   - Returns structured data to the frontend

2. The frontend is already configured to call `${VITE_API_BASE_URL}/gmp-data` when in production mode.

3. Your backend should accept POST requests with this structure:
   ```javascript
   // Request
   POST /api/gmp-data
   {
     "company": "Swiggy"
   }
   
   // Response
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
     "source": "https://example.com"
   }
   ```

## Project Structure

```
IPO/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Netlify**: Deployment configuration

## Deployment

The app is configured for Netlify deployment with:
- SPA routing support (all routes redirect to index.html)
- Optimized build output

## Disclaimer

This analysis is for informational purposes only. GMP data is from unofficial grey market sources and is subject to high volatility. Please conduct your own research and consult with a SEBI-registered financial advisor before making investment decisions.

## License

This project is for educational purposes.

