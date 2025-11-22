# IPO Analyzer Backend Server

Backend API server for the IPO Analyzer application. This server handles secure API calls to external services like Anthropic.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your-actual-api-key-here
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST `/api/gmp-data`
Fetches GMP data for a company.

**Request:**
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
  "source": "https://www.investorgain.com/report/live-ipo-gmp/331/"
}
```

### GET `/api/health`
Health check endpoint.

## Configuration

The server uses environment variables for configuration:
- `PORT`: Server port (default: 3000)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (required for production)

## Security Notes

- Never commit `.env` file to version control
- Keep API keys secure
- Use environment variables for all sensitive data
- Consider adding rate limiting for production

