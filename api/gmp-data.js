import { fetchLiveGMPData } from '../server/gmpScraper.js';
import { clearGmpCache } from '../server/gmpScraper.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      
      const { company } = JSON.parse(body);
      
      if (!company) {
        return res.status(400).json({ 
          error: 'Company name is required',
          message: 'Please provide a company name in the request body'
        });
      }

      const gmpData = await fetchLiveGMPData(company);
      
      if (gmpData.error) {
        return res.status(404).json(gmpData);
      }
      
      res.status(200).json(gmpData);
    } else {
      res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Error in gmp-data API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
