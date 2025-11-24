import { clearGmpCache } from '../server/gmpScraper.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      clearGmpCache();
      res.status(200).json({ 
        success: true, 
        message: 'GMP cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Error in clear-cache API:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error.message 
    });
  }
}
