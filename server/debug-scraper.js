import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchLiveGMPData } from './gmpScraper.js';

async function debugScraper() {
  console.log('=== Testing GMP Scraper ===');
  
  // Test the companies we saw in the table
  const companies = ['Excelsoft Technologies', 'Capillary Technologies'];
  
  for (const company of companies) {
    console.log(`\n--- Testing: ${company} ---`);
    try {
      const result = await fetchLiveGMPData(company);
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
  
  // Also test the raw scraping
  console.log('\n=== Raw Scraping Test ===');
  try {
    const response = await axios.get('https://www.ipowatch.in/ipo-grey-market-premium', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    console.log('Page loaded successfully');
    
    const tables = $('table');
    console.log(`Found ${tables.length} tables`);
    
    tables.each((tableIndex, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      console.log(`\nTable ${tableIndex}: ${rows.length} rows`);
      
      rows.each((i, elem) => {
        const $row = $(elem);
        const cells = $row.find('td');
        
        if (cells.length >= 3) {
          const companyCell = $(cells[0]).text().trim();
          const gmpCell = $(cells[1]).text().trim();
          const priceCell = $(cells[2]).text().trim();
          
          if (companyCell && (companyCell.includes('Excelsoft') || companyCell.includes('Capillary'))) {
            console.log(`  MATCH Row ${i}: "${companyCell}" | GMP: "${gmpCell}" | Price: "${priceCell}"`);
          }
        }
      });
    });
    
  } catch (error) {
    console.error('Raw scraping error:', error.message);
  }
}

debugScraper();
