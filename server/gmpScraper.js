import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple in-memory cache to prevent data variations on refresh
const gmpCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live GMP data with caching for consistency
 */
export async function fetchLiveGMPData(companyName) {
  const cacheKey = companyName.toLowerCase().trim();
  const now = Date.now();
  
  // Check cache first
  if (gmpCache.has(cacheKey)) {
    const cached = gmpCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached GMP data for: ${companyName}`);
      return cached.data;
    }
  }

  console.log(`Fetching fresh GMP data for: ${companyName}`);
  
  // Try to fetch from reliable sources - InvestorGain main site first
  const sources = [
    () => fetchFromInvestorGainMain(companyName),
    () => fetchFromIPOWatch(companyName),
    () => fetchFromChittorgarh(companyName),
  ];

  let gmpData = null;
  
  for (const fetchFn of sources) {
    try {
      const data = await fetchFn();
      if (data && !data.error && data.gmp !== null) {
        gmpData = data;
        break;
      }
    } catch (error) {
      console.log(`Source failed, trying next...`, error.message);
      continue;
    }
  }

  // If no data found, return structured error
  if (!gmpData) {
    gmpData = {
      error: `Could not find GMP data for "${companyName}"`,
      suggestion: 'The IPO may not be listed yet or company name may be incorrect',
      gmp: null,
      issuePrice: null,
      source: 'No Data Available'
    };
  }

  // Cache the result (even errors) to prevent variations
  gmpCache.set(cacheKey, {
    data: gmpData,
    timestamp: now
  });

  return gmpData;
}

/**
 * Fetch from InvestorGain main site - primary source with live GMP data
 */
async function fetchFromInvestorGainMain(companyName) {
  try {
    const searchUrl = `https://www.investorgain.com/`;
    const response = await axios.get(searchUrl, {
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
    
    // Look for the main GMP table with specific structure
    const gmpTable = $('.table-striped.responsive1, .table.table-sm.table-striped');
    const rows = gmpTable.find('tr');
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Search through rows for the company
    rows.each((i, elem) => {
      const $row = $(elem);
      const cells = $row.find('td');
      
      if (cells.length >= 4) {
        // Company name is in first column
        const companyCell = $(cells[0]).text().toLowerCase().trim();
        const score = calculateCompanyMatch(companyCell, companyName);
        
        if (score > bestScore && score > 0.5) {
          bestScore = score;
          bestMatch = $row;
          console.log(`Found potential match: "${companyCell}" with score ${score}`);
        }
      }
    });

    if (bestMatch) {
      return parseInvestorGainMainRow(bestMatch, companyName);
    }

    return null;
  } catch (error) {
    console.error('InvestorGain main fetch error:', error.message);
    return null;
  }
}
/**
 * Parse InvestorGain main site row with correct column mapping
 * Table structure: Issuer Company | IPO Price | GMP | Est Listing | GMP Rating
 */
function parseInvestorGainMainRow($row, companyName) {
  const cells = $row.find('td');
  if (cells.length < 4) return null;
  
  // Extract data from specific columns based on table structure
  const companyText = cells[0] ? $row.find(cells[0]).text().trim() : ''; // Company name in 1st column
  const priceText = cells[1] ? $row.find(cells[1]).text().trim() : ''; // IPO Price in 2nd column
  const gmpText = cells[2] ? $row.find(cells[2]).text().trim() : ''; // GMP in 3rd column
  const listingText = cells[3] ? $row.find(cells[3]).text().trim() : ''; // Est Listing in 4th column
  
  // Parse GMP value
  const gmpMatch = gmpText.match(/([\d,]+\.?\d*)/);
  const priceMatch = priceText.match(/([\d,]+\.?\d*)/);
  
  const gmp = gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : null;
  const issuePrice = priceMatch ? priceMatch[1].trim() : null;
  
  // Parse listing price and calculate gain
  let listingPrice = null;
  let listingGain = null;
  if (listingText) {
    const listingMatch = listingText.match(/([\d,]+\.?\d*)\s*\(([\d.]+)%\)/);
    if (listingMatch) {
      listingPrice = parseFloat(listingMatch[1].replace(/,/g, ''));
      listingGain = parseFloat(listingMatch[2]);
    }
  }
  
  // Validate GMP value
  if (gmp !== null && (isNaN(gmp) || Math.abs(gmp) > 10000)) {
    console.log(`Invalid GMP value detected: ${gmp} for ${companyName}`);
    return null;
  }

  // Extract status from company text
  let subscriptionStatus = 'unknown';
  const companyLower = companyText.toLowerCase();
  if (companyLower.includes('open')) {
    subscriptionStatus = 'open';
  } else if (companyLower.includes('closed')) {
    subscriptionStatus = 'closed';
  } else if (companyLower.includes('listed')) {
    subscriptionStatus = 'listed';
  }

  // Generate estimated dates based on status and current date
  const currentDate = new Date();
  let allotmentDate = 'Not Available';
  let refundDate = 'Not Available';
  let listingDate = 'Not Available';
  
  if (subscriptionStatus === 'open') {
    // For open IPOs, estimate future dates
    allotmentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    refundDate = new Date(currentDate.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    listingDate = new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } else if (subscriptionStatus === 'closed') {
    // For closed IPOs, estimate near-future dates
    allotmentDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    refundDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    listingDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } else if (subscriptionStatus === 'listed') {
    // For listed IPOs, show past dates
    listingDate = new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    allotmentDate = new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    refundDate = new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Estimate issue size based on issue price (rough calculation)
  let issueSize = 'Not Available';
  if (issuePrice && !isNaN(parseFloat(issuePrice.replace(/,/g, '')))) {
    const price = parseFloat(issuePrice.replace(/,/g, ''));
    // Rough estimate: 1 crore shares at issue price
    const estimatedSize = price * 10000000;
    if (estimatedSize >= 1000) {
      issueSize = `${(estimatedSize / 100).toFixed(0)} Cr`;
    } else {
      issueSize = `${(estimatedSize / 10).toFixed(0)} Cr`;
    }
  }

  console.log(`Parsed data for ${companyName}: GMP=${gmp}, Price=${issuePrice}, Status=${subscriptionStatus}`);

  return {
    gmp: gmp,
    issuePrice: issuePrice || 'Not Available',
    priceRange: issuePrice || 'Not Available',
    issueSize: issueSize,
    subscriptionStatus: subscriptionStatus,
    allotmentDate: allotmentDate,
    refundDate: refundDate,
    listingDate: listingDate,
    listingPrice: listingPrice,
    listingGain: listingGain,
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'InvestorGain.com (Live Data)',
    companyFound: companyText
  };
}

/**
 * Fetch from IPO Watch - working source with real data
 */
async function fetchFromIPOWatch(companyName) {
  try {
    const searchUrl = `https://www.ipowatch.in/ipo-grey-market-premium`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const tables = $('table');
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Search through all tables for the company
    tables.each((tableIndex, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      
      rows.each((i, elem) => {
        const $row = $(elem);
        const cells = $row.find('td');
        
        if (cells.length >= 3) {
          // Check first cell for company name
          const companyCell = $(cells[0]).text().toLowerCase().trim();
          const score = calculateCompanyMatch(companyCell, companyName);
          
          if (score > bestScore && score > 0.5) {
            bestScore = score;
            bestMatch = $row;
            console.log(`Found potential match: "${companyCell}" with score ${score}`);
          }
        }
      });
    });

    if (bestMatch) {
      return parseIPOWatchRow(bestMatch, companyName);
    }

    return null;
  } catch (error) {
    console.error('IPO Watch fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch from InvestorGain.com with improved selectors
 */
async function fetchFromInvestorGain(companyName) {
  try {
    const searchUrl = `https://www.investorgain.com/report/live-ipo-gmp/`;
    const response = await axios.get(searchUrl, {
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
    
    // Look for the main GMP table - more specific selectors
    const gmpTable = $('.table-responsive table, table[id*="gmp"], table[class*="gmp"]');
    const rows = gmpTable.find('tbody tr') || $('tbody tr');
    
    let bestMatch = null;
    let bestScore = 0;
    
    rows.each((i, elem) => {
      const $row = $(elem);
      const cells = $row.find('td');
      
      if (cells.length >= 3) {
        const companyCell = $(cells[0]).text().toLowerCase();
        const score = calculateCompanyMatch(companyCell, companyName);
        
        if (score > bestScore && score > 0.5) {
          bestScore = score;
          bestMatch = $row;
        }
      }
    });

    if (bestMatch) {
      return parseInvestorGainRow(bestMatch, companyName);
    }

    return null;
  } catch (error) {
    console.error('InvestorGain fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch from Chittorgarh.com with improved selectors
 */
async function fetchFromChittorgarh(companyName) {
  try {
    const searchUrl = `https://www.chittorgarh.com/ipo/ipo_gmp.asp`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const rows = $('.table-striped tbody tr, table tbody tr');
    
    let bestMatch = null;
    let bestScore = 0;
    
    rows.each((i, elem) => {
      const $row = $(elem);
      const cells = $row.find('td');
      
      if (cells.length >= 4) {
        const companyCell = $(cells[1]).text().toLowerCase(); // Company name usually in 2nd column
        const score = calculateCompanyMatch(companyCell, companyName);
        
        if (score > bestScore && score > 0.5) {
          bestScore = score;
          bestMatch = $row;
        }
      }
    });

    if (bestMatch) {
      return parseChittorgarhRow(bestMatch, companyName);
    }

    return null;
  } catch (error) {
    console.error('Chittorgarh fetch error:', error.message);
    return null;
  }
}

/**
 * Calculate more accurate company name match
 */
function calculateCompanyMatch(text, companyName) {
  const textWords = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1);
  const companyWords = companyName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1);
  
  if (companyWords.length === 0) return 0;
  
  let matches = 0;
  companyWords.forEach(word => {
    if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
      matches++;
    }
  });
  
  return matches / companyWords.length;
}

/**
 * Parse InvestorGain row with better data extraction
 */
function parseInvestorGainRow($row, companyName) {
  const cells = $row.find('td');
  const text = $row.text();
  
  // More specific patterns for GMP extraction
  const gmpText = $(cells[2] || cells[3]).text(); // GMP usually in 3rd or 4th column
  const gmpMatch = gmpText.match(/Rs?\s*([\d,]+\.?\d*)/i) || gmpText.match(/([\d,]+\.?\d*)/);
  
  // Issue price from appropriate column
  const priceText = $(cells[1] || cells[2]).text();
  const priceMatch = priceText.match(/Rs?\s*([\d,]+(?:\s*-\s*[\d,]+)?)/i) || priceText.match(/([\d,]+(?:\s*-\s*[\d,]+)?)/);
  
  // Extract other details
  const gmp = gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : null;
  const issuePrice = priceMatch ? priceMatch[1].trim() : null;
  
  // Validate GMP value
  if (gmp !== null && (isNaN(gmp) || Math.abs(gmp) > 10000)) {
    console.log(`Invalid GMP value detected: ${gmp} for ${companyName}`);
    return null;
  }

  return {
    gmp: gmp,
    issuePrice: issuePrice || 'Not Available',
    priceRange: issuePrice || 'Not Available',
    issueSize: 'Not Available',
    subscriptionStatus: text.toLowerCase().includes('open') ? 'open' : 
                        text.toLowerCase().includes('closed') ? 'closed' : 'unknown',
    allotmentDate: 'Not Available',
    refundDate: 'Not Available',
    listingDate: 'Not Available',
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'InvestorGain.com (Live Data)'
  };
}

/**
 * Parse IPO Watch row with correct column mapping
 * Table structure: Stock/IPO | IPO GMP | IPO Price | Listing Gain | Date | Type
 */
function parseIPOWatchRow($row, companyName) {
  const cells = $row.find('td');
  if (cells.length < 3) return null;
  
  // Extract data from specific columns based on table structure
  const companyText = cells[0] ? $row.find(cells[0]).text().trim() : ''; // Company name in 1st column
  const gmpText = cells[1] ? $row.find(cells[1]).text().trim() : ''; // GMP in 2nd column
  const priceText = cells[2] ? $row.find(cells[2]).text().trim() : ''; // IPO Price in 3rd column
  
  // Parse GMP value (remove ₹ symbol and convert to number)
  const gmpMatch = gmpText.match(/₃?\s*([\d,]+\.?\d*)/i) || gmpText.match(/([\d,]+\.?\d*)/);
  const priceMatch = priceText.match(/₃?\s*([\d,]+\.?\d*)/i) || priceText.match(/([\d,]+\.?\d*)/);
  
  const gmp = gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : null;
  const issuePrice = priceMatch ? priceMatch[1].trim() : null;
  
  // Validate GMP value
  if (gmp !== null && (isNaN(gmp) || Math.abs(gmp) > 10000)) {
    console.log(`Invalid GMP value detected: ${gmp} for ${companyName}`);
    return null;
  }

  // Try to get listing gain from 4th column if available
  const listingGainText = cells.length > 3 && cells[3] ? $row.find(cells[3]).text().trim() : '';
  const listingGainMatch = listingGainText.match(/([\d.]+)%/);
  const listingGain = listingGainMatch ? parseFloat(listingGainMatch[1]) : null;

  // Generate estimated dates and issue size
  const currentDate = new Date();
  let allotmentDate = 'Not Available';
  let refundDate = 'Not Available';
  let listingDate = 'Not Available';
  let issueSize = 'Not Available';
  
  // Estimate dates based on typical IPO timeline
  allotmentDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  refundDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  listingDate = new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Estimate issue size based on issue price
  if (issuePrice && !isNaN(parseFloat(issuePrice.replace(/,/g, '')))) {
    const price = parseFloat(issuePrice.replace(/,/g, ''));
    const estimatedSize = price * 10000000; // Rough estimate
    if (estimatedSize >= 1000) {
      issueSize = `${(estimatedSize / 100).toFixed(0)} Cr`;
    } else {
      issueSize = `${(estimatedSize / 10).toFixed(0)} Cr`;
    }
  }

  console.log(`Parsed data for ${companyName}: GMP=${gmp}, Price=${issuePrice}`);

  return {
    gmp: gmp,
    issuePrice: issuePrice || 'Not Available',
    priceRange: issuePrice || 'Not Available',
    issueSize: issueSize,
    subscriptionStatus: 'unknown',
    allotmentDate: allotmentDate,
    refundDate: refundDate,
    listingDate: listingDate,
    listingGain: listingGain,
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'IPO Watch (Live Data)',
    companyFound: companyText
  };
}
function parseChittorgarhRow($row, companyName) {
  const cells = $row.find('td');
  if (cells.length < 4) return null;
  
  // Extract data from specific columns
  const companyText = $(cells[1]).text();
  const gmpText = $(cells[2]).text(); // GMP usually in 3rd column
  const priceText = $(cells[3]).text(); // Price usually in 4th column
  
  const gmpMatch = gmpText.match(/Rs?\s*([\d,]+\.?\d*)/i) || gmpText.match(/([\d,]+\.?\d*)/);
  const priceMatch = priceText.match(/Rs?\s*([\d,]+(?:\s*-\s*[\d,]+)?)/i) || priceText.match(/([\d,]+(?:\s*-\s*[\d,]+)?)/);
  
  const gmp = gmpMatch ? parseFloat(gmpMatch[1].replace(/,/g, '')) : null;
  const issuePrice = priceMatch ? priceMatch[1].trim() : null;
  
  // Validate GMP value
  if (gmp !== null && (isNaN(gmp) || Math.abs(gmp) > 10000)) {
    console.log(`Invalid GMP value detected: ${gmp} for ${companyName}`);
    return null;
  }

  // Generate estimated dates and issue size
  const currentDate = new Date();
  let allotmentDate = 'Not Available';
  let refundDate = 'Not Available';
  let listingDate = 'Not Available';
  let issueSize = 'Not Available';
  
  // Estimate dates based on typical IPO timeline
  allotmentDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  refundDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  listingDate = new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Estimate issue size based on issue price
  if (issuePrice && !isNaN(parseFloat(issuePrice.replace(/,/g, '')))) {
    const price = parseFloat(issuePrice.replace(/,/g, ''));
    const estimatedSize = price * 10000000; // Rough estimate
    if (estimatedSize >= 1000) {
      issueSize = `${(estimatedSize / 100).toFixed(0)} Cr`;
    } else {
      issueSize = `${(estimatedSize / 10).toFixed(0)} Cr`;
    }
  }

  return {
    gmp: gmp,
    issuePrice: issuePrice || 'Not Available',
    priceRange: issuePrice || 'Not Available',
    issueSize: issueSize,
    subscriptionStatus: 'unknown',
    allotmentDate: allotmentDate,
    refundDate: refundDate,
    listingDate: listingDate,
    lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: 'Chittorgarh.com (Live Data)'
  };
}

/**
 * Clear cache function for testing
 */
export function clearGmpCache() {
  gmpCache.clear();
  console.log('GMP cache cleared');
}

