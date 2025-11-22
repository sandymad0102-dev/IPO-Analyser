import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchLiveGMPData } from './gmpScraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Optional: Fetch GMP data using Anthropic API (if API key is provided)
async function fetchGMPFromAnthropic(companyName) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10000,
      messages: [{
        role: "user",
        content: `Find live IPO GMP data for "${companyName}".

STEPS:
1. Search for "${companyName} IPO GMP live" using web_search
2. Look for investorgain.com or chittorgarh.com in results
3. Use web_fetch to get the page content
4. Extract: GMP (number only), issue price, issue size, dates, subscription status

Today is ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.

Return ONLY JSON (no markdown):
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

If not found: {"error": "Could not find data"}`
      }],
      tools: [{
        type: "web_search_20250305",
        name: "web_search"
      }]
    });

    // Parse the response
    let textContent = '';
    if (message.content && Array.isArray(message.content)) {
      textContent = message.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
    }

    // Extract JSON from response
    let gmpData = null;
    try {
      gmpData = JSON.parse(textContent.trim());
    } catch (e) {
      const codeBlockMatch = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        gmpData = JSON.parse(codeBlockMatch[1].trim());
      }
    }

    return gmpData;
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    return null;
  }
}

// API Routes
app.post('/api/gmp-data', async (req, res) => {
  try {
    const { company } = req.body;

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    console.log(`Fetching GMP data for: ${company}`);

    // Try Anthropic API first (if configured)
    let gmpData = await fetchGMPFromAnthropic(company);
    
    // If Anthropic fails or not configured, use web scraping
    if (!gmpData || gmpData.error) {
      console.log('Using web scraping to fetch GMP data...');
      gmpData = await fetchLiveGMPData(company);
    }

    if (gmpData && !gmpData.error) {
      console.log('Successfully fetched GMP data:', gmpData.source);
      return res.json(gmpData);
    }

    // If all methods fail, return error
    return res.status(404).json({ 
      error: `Could not find GMP data for "${company}". The IPO may not be listed or data may not be available yet.`,
      suggestion: 'Try checking the company name spelling or use demo mode for testing.'
    });
  } catch (error) {
    console.error('Error in /api/gmp-data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 IPO Analyzer Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/gmp-data`);
  console.log(`✅ Live data fetching: ENABLED (Web Scraping)`);
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(`✅ Anthropic API: CONFIGURED (will be used as primary source)`);
  } else {
    console.log(`ℹ️  Anthropic API: Not configured (using web scraping only)`);
  }
  console.log(`\n📊 Ready to fetch live IPO GMP data!`);
});

