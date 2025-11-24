import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScraping() {
  const urls = [
    'https://www.investorgain.com/report/live-ipo-gmp/',
    'https://www.chittorgarh.com/ipo/ipo_gmp.asp',
    'https://www.ipowatch.in/ipo-grey-market-premium',
    'https://rbi.org.in' // Test basic connectivity
  ];

  for (const url of urls) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      console.log(`✅ Success - Status: ${response.status}`);
      console.log(`Page title: ${$('title').text()}`);
      console.log(`Tables found: ${$('table').length}`);
      
      // Look for GMP-related content
      const bodyText = $('body').text().toLowerCase();
      if (bodyText.includes('gmp') || bodyText.includes('grey market') || bodyText.includes('premium')) {
        console.log('🎯 Found GMP-related content!');
        
        // Look for tables with IPO data
        $('table').each((i, table) => {
          const $table = $(table);
          const rows = $table.find('tr').slice(0, 2);
          if (rows.length > 0) {
            console.log(`  Table ${i} sample data:`);
            rows.each((j, row) => {
              const $row = $(row);
              const cells = $row.find('td, th');
              const cellTexts = [];
              cells.each((k, cell) => {
                const text = $(cell).text().trim();
                if (text) cellTexts.push(text);
              });
              if (cellTexts.length > 0) {
                console.log(`    ${cellTexts.join(' | ')}`);
              }
            });
          }
        });
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testScraping();
