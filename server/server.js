import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fetchLiveGMPData, clearGmpCache } from './gmpScraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files and common document formats
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Function to extract company name from DRHP content
function extractCompanyNameFromDRHP(text) {
  // Common patterns for company names in DRHP documents
  const patterns = [
    /(?:We|The Company|Our Company)[\s,]*(?:is|are)[\s,]*([A-Z][a-zA-Z\s&]+?)(?:\s+(?:Ltd|Limited|Private|Public|Inc|Corporation))/i,
    /(?:Company Name|Name of Company)[\s:]*([A-Z][a-zA-Z\s&]+?)(?:\s+(?:Ltd|Limited|Private|Public|Inc|Corporation))/i,
    /^([A-Z][a-zA-Z\s&]+?)(?:\s+(?:Ltd|Limited|Private|Public|Inc|Corporation))/im,
    /(?:IPO|Initial Public Offering)[\s,]*of[\s,]*([A-Z][a-zA-Z\s&]+?)(?:\s+(?:Ltd|Limited))/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }

  // Fallback: Look for capitalized words that might be company names
  const lines = text.split('\n').slice(0, 50); // Check first 50 lines
  for (const line of lines) {
    const words = line.trim().split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const threeWords = words.slice(i, i + 3).join(' ');
      if (/^[A-Z][a-zA-Z\s&]+$/.test(threeWords) && threeWords.length > 10) {
        return threeWords.trim();
      }
    }
  }

  return null;
}

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

// DRHP File Upload and Analysis Endpoint
app.post('/api/analyze-drhp', upload.single('drhpFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'DRHP file is required' });
    }

    console.log(`Processing DRHP file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // For now, we'll extract text from the buffer (in a real implementation, you'd use PDF parsing libraries)
    // This is a simplified version that extracts company name from filename or basic text
    let companyName = null;
    let extractedText = '';

    // Try to extract company name from filename first
    const filename = req.file.originalname.toLowerCase();
    const filenameMatch = filename.match(/([a-z][a-z\s&]+?)(?:\s+(?:drhp|ipo|draft|red|herring))/i);
    if (filenameMatch && filenameMatch[1]) {
      companyName = filenameMatch[1].trim().replace(/\s+/g, ' ');
    }

    // If no company name found in filename, try to extract from buffer (simplified)
    if (!companyName && req.file.buffer) {
      // Convert buffer to string and try to extract company name
      extractedText = req.file.buffer.toString('utf8', 0, Math.min(req.file.buffer.length, 5000));
      companyName = extractCompanyNameFromDRHP(extractedText);
    }

    // If still no company name, ask user to provide it
    if (!companyName) {
      return res.status(400).json({ 
        error: 'Could not extract company name from DRHP file',
        suggestion: 'Please ensure the DRHP contains a clear company name or enter it manually',
        requiresManualInput: true
      });
    }

    console.log(`Extracted company name: ${companyName}`);

    // Now fetch GMP data for the extracted company name
    let gmpData = await fetchGMPFromAnthropic(companyName);
    
    // If Anthropic fails or not configured, use web scraping
    if (!gmpData || gmpData.error) {
      console.log('Using web scraping to fetch GMP data...');
      gmpData = await fetchLiveGMPData(companyName);
    }

    if (gmpData && !gmpData.error) {
      console.log('Successfully fetched GMP data for DRHP analysis:', gmpData.source);
      return res.json({
        companyName: companyName,
        extractedFrom: 'DRHP file',
        ...gmpData
      });
    }

    // If GMP data fetch fails, still return the company name
    return res.json({
      companyName: companyName,
      extractedFrom: 'DRHP file',
      gmp: null,
      error: `GMP data not available for "${companyName}"`,
      suggestion: 'The IPO may not be listed yet or data may not be available'
    });

  } catch (error) {
    console.error('Error in /api/analyze-drhp:', error);
    res.status(500).json({ 
      error: 'Error processing DRHP file',
      message: error.message 
    });
  }
});

// Clear GMP cache endpoint
app.post('/api/clear-cache', (req, res) => {
  try {
    clearGmpCache();
    res.json({ 
      success: true, 
      message: 'GMP cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
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

