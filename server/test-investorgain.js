import axios from 'axios';
import * as cheerio from 'cheerio';

async function testInvestorGain() {
  try {
    console.log('Testing InvestorGain main site...');
    const response = await axios.get('https://www.investorgain.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    console.log('✅ Success - Status:', response.status);
    console.log('Page title:', $('title').text());
    console.log('Tables found:', $('table').length);
    
    // Look for GMP-related content
    const bodyText = $('body').text().toLowerCase();
    if (bodyText.includes('gmp') || bodyText.includes('grey market') || bodyText.includes('ipo')) {
      console.log('🎯 Found GMP/IPO content!');
      
      // Look for tables with IPO data
      $('table').each((i, table) => {
        const $table = $(table);
        const className = $table.attr('class') || 'no-class';
        const id = $table.attr('id') || 'no-id';
        console.log(`\nTable ${i}: class="${className}", id="${id}"`);
        
        // Show first few rows
        const rows = $table.find('tr').slice(0, 5);
        rows.each((j, row) => {
          const $row = $(row);
          const cells = $row.find('td, th');
          if (cells.length > 0) {
            const cellTexts = [];
            cells.each((k, cell) => {
              const text = $(cell).text().trim();
              if (text) cellTexts.push(text);
            });
            if (cellTexts.length > 0) {
              console.log(`    Row ${j}: ${cellTexts.join(' | ')}`);
            }
          }
        });
      });
    }

    // Also look for specific GMP sections or divs
    console.log('\nLooking for GMP sections...');
    const gmpSections = $('[class*="gmp"], [id*="gmp"], [class*="ipo"], [id*="ipo"]');
    console.log(`Found ${gmpSections.length} GMP/IPO sections`);
    
    gmpSections.each((i, section) => {
      const $section = $(section);
      const text = $section.text().trim();
      if (text.length > 0 && text.length < 500) {
        console.log(`Section ${i}: ${text.substring(0, 200)}...`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testInvestorGain();
