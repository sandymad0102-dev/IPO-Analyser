import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetch live GMP data from IPO websites
 * Tries multiple sources for reliability
 */
export async function fetchLiveGMPData(companyName) {
  const sources = [
    () => fetchFromInvestorGain(companyName),
    () => fetchFromChittorgarh(companyName),
    () => fetchFromIPOWatch(companyName),
  ];

  // Try each source until one succeeds
  for (const fetchFn of sources) {
    try {
      const data = await fetchFn();
      if (data && !data.error) {
        return data;
      }
    } catch (error) {
      console.log(`Source failed, trying next...`, error.message);
      continue;
    }
  }

  return { error: 'Could not fetch GMP data from any source' };
}

/**
 * Fetch from InvestorGain.com
 */
async function fetchFromInvestorGain(companyName) {
  try {
    // Search for the company IPO page
    const searchUrl = `https://www.investorgain.com/report/live-ipo-gmp/`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // Look for IPO data in the page
    // This is a generic scraper - you may need to adjust selectors based on actual page structure
    const ipoRows = $('table tbody tr, .ipo-row, .gmp-data');
    
    let bestMatch = null;
    let bestScore = 0;
    
    ipoRows.each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      const companyLower = companyName.toLowerCase();
      const score = calculateMatchScore(text, companyLower);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = $(elem);
      }
    });

    if (bestMatch && bestScore > 0.3) {
      return parseInvestorGainRow(bestMatch, companyName);
    }

    // Fallback: try to find by company name in page
    const pageText = $('body').text().toLowerCase();
    if (pageText.includes(companyName.toLowerCase())) {
      return parseInvestorGainPage($, companyName);
    }

    return null;
  } catch (error) {
    console.error('InvestorGain fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch from Chittorgarh.com
 */
async function fetchFromChittorgarh(companyName) {
  try {
    const searchUrl = `https://www.chittorgarh.com/ipo/ipo_gmp.asp`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const ipoRows = $('table tbody tr, .ipo-list tr');
    
    let bestMatch = null;
    let bestScore = 0;
    
    ipoRows.each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      const companyLower = companyName.toLowerCase();
      const score = calculateMatchScore(text, companyLower);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = $(elem);
      }
    });

    if (bestMatch && bestScore > 0.3) {
      return parseChittorgarhRow(bestMatch, companyName);
    }

    return null;
  } catch (error) {
    console.error('Chittorgarh fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch from IPO Watch or other sources
 */
async function fetchFromIPOWatch(companyName) {
  // Placeholder for additional sources
  // You can add more scraping logic here
  return null;
}

/**
 * Calculate match score between text and company name
 */
function calculateMatchScore(text, companyName) {
  const words = companyName.split(/\s+/).filter(w => w.length > 2);
  let score = 0;
  
  words.forEach(word => {
    if (text.includes(word)) {
      score += 1;
    }
  });
  
  return score / words.length;
}

/**
 * Parse InvestorGain row data
 */
function parseInvestorGainRow($row, companyName) {
  const text = $row.text();
  
  // Extract GMP (look for patterns like "GMP: 45" or "Rs 45")
  const gmpMatch = text.match(/(?:GMP|Grey Market Premium)[:\s]*Rs?\.?\s*([\d,]+\.?\d*)/i) ||
                   text.match(/Rs?\.?\s*([\d,]+\.?\d*)\s*(?:GMP|premium)/i);
  
  // Extract issue price
  const priceMatch = text.match(/(?:Issue Price|Price)[:\s]*Rs?\.?\s*([\d,]+(?:\s*-\s*[\d,]+)?)/i) ||
                     text.match(/Rs?\.?\s*([\d,]+(?:\s*-\s*[\d,]+)?)\s*(?:per share|issue)/i);
  
  // Extract issue size
  const sizeMatch = text.match(/(?:Issue Size|Size)[:\s]*Rs?\.?\s*([\d,]+\.?\d*)\s*(?:Cr|Crore)/i);
  
  // Extract dates
  const datePattern = /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi;
  const dates = text.match(datePattern) || [];
  
  const gmp = gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : null;
  const issuePrice = priceMatch ? priceMatch[1].trim() : null;
  const issueSize = sizeMatch ? `${sizeMatch[1]} Cr` : null;
  
  if (!gmp && !issuePrice) {
    return null;
  }

  return {
    gmp: gmp || 0,
    issuePrice: issuePrice || 'Not Available',
    priceRange: issuePrice || 'Not Available',
    issueSize: issueSize || 'Not Available',
    subscriptionStatus: text.toLowerCase().includes('open') ? 'open' : 
                        text.toLowerCase().includes('closed') ? 'closed' : 'unknown',
    allotmentDate: dates[0] || 'Not Available',
    refundDate: dates[1] || 'Not Available',
    listingDate: dates[2] || 'Not Available',
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'InvestorGain.com (Live Data)'
  };
}

/**
 * Parse InvestorGain page data
 */
function parseInvestorGainPage($, companyName) {
  const pageText = $('body').text();
  
  // Try to extract data from page content
  const gmpMatch = pageText.match(/(?:GMP|Grey Market Premium)[:\s]*Rs?\.?\s*([\d,]+\.?\d*)/i);
  const priceMatch = pageText.match(/(?:Issue Price|Price Band)[:\s]*Rs?\.?\s*([\d,]+(?:\s*-\s*[\d,]+)?)/i);
  
  if (gmpMatch || priceMatch) {
    return {
      gmp: gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : 0,
      issuePrice: priceMatch ? priceMatch[1].trim() : 'Not Available',
      priceRange: priceMatch ? priceMatch[1].trim() : 'Not Available',
      issueSize: 'Not Available',
      subscriptionStatus: 'unknown',
      allotmentDate: 'Not Available',
      refundDate: 'Not Available',
      listingDate: 'Not Available',
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: 'InvestorGain.com (Live Data)'
    };
  }
  
  return null;
}

/**
 * Parse Chittorgarh row data
 */
function parseChittorgarhRow($row, companyName) {
  const cells = $row.find('td');
  if (cells.length < 3) return null;
  
  const text = $row.text();
  const gmpMatch = text.match(/Rs?\.?\s*([\d,]+\.?\d*)/);
  const priceMatch = text.match(/([\d,]+(?:\s*-\s*[\d,]+)?)/);
  
  return {
    gmp: gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : 0,
    issuePrice: priceMatch ? priceMatch[1].trim() : 'Not Available',
    priceRange: priceMatch ? priceMatch[1].trim() : 'Not Available',
    issueSize: 'Not Available',
    subscriptionStatus: 'unknown',
    allotmentDate: 'Not Available',
    refundDate: 'Not Available',
    listingDate: 'Not Available',
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'Chittorgarh.com (Live Data)'
  };
}

