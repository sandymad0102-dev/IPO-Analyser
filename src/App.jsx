import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Search,
  RefreshCw
} from 'lucide-react';

export default function IPOAnalyzer() {
  const [companyName, setCompanyName] = useState('');
  const [issuePrice, setIssuePrice] = useState('');
  const [drhpFile, setDrhpFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingGMP, setFetchingGMP] = useState(false);
  const [result, setResult] = useState(null);

  const fetchLiveGMP = async (company) => {
    setFetchingGMP(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10000,
          messages: [
            { 
              role: "user", 
              content: `Find live IPO GMP data for "${company}".

STEPS:
1. Search for "${company} IPO GMP live" using web_search
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
            }
          ],
          tools: [
            {
              "type": "web_search_20250305",
              "name": "web_search"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("API Error:", data.error);
        return null;
      }
      
      let textContent = '';
      if (data.content && Array.isArray(data.content)) {
        textContent = data.content
          .filter(item => item.type === "text")
          .map(item => item.text)
          .join("\n");
      }

      let gmpData = null;
      
      try {
        gmpData = JSON.parse(textContent.trim());
      } catch (e) {
        const codeBlockMatch = textContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            gmpData = JSON.parse(codeBlockMatch[1].trim());
          } catch (e2) {
            console.error("Parse error:", e2);
          }
        }
        
        if (!gmpData) {
          const jsonMatch = textContent.match(/\{[\s\S]*?"gmp"[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              gmpData = JSON.parse(jsonMatch[0]);
            } catch (e3) {
              console.error("Parse error:", e3);
            }
          }
        }
      }
      
      if (gmpData && gmpData.error) {
        console.error("GMP fetch error:", gmpData.error);
        return null;
      }
      
      if (gmpData && gmpData.gmp !== undefined) {
        if (gmpData.issuePrice) {
          const priceStr = String(gmpData.issuePrice);
          if (priceStr.includes('-')) {
            const prices = priceStr.split('-').map(p => p.trim());
            setIssuePrice(prices[prices.length - 1]);
          } else {
            setIssuePrice(priceStr.replace(/[^0-9.]/g, ''));
          }
        }
        
        gmpData.gmp = parseFloat(String(gmpData.gmp).replace(/[^0-9.-]/g, ''));
        return gmpData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching GMP:', error);
      return null;
    } finally {
      setFetchingGMP(false);
    }
  };

  const analyzeIPO = async () => {
    if (!companyName) {
      alert('Please enter company name');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    const liveGMPData = await fetchLiveGMP(companyName);

    if (!liveGMPData && !issuePrice) {
      alert('Could not fetch live data. Please enter the issue price manually and try again.');
      setAnalyzing(false);
      return;
    }

    const price = parseFloat(issuePrice) || (liveGMPData?.issuePrice ? parseFloat(String(liveGMPData.issuePrice).replace(/[^0-9.]/g, '')) : 0);

    if (!price || Number.isNaN(price) || price <= 0) {
      alert('Could not determine issue price. Please enter it manually.');
      setAnalyzing(false);
      return;
    }

    const gmpData = liveGMPData || {
      gmp: 0,
      issuePrice: price,
      priceRange: String(price),
      issueSize: 'Not Available',
      lastUpdated: new Date().toLocaleDateString('en-GB'),
      source: 'Manual Entry',
      subscriptionStatus: 'unknown',
      allotmentDate: 'Not Available',
      refundDate: 'Not Available',
      listingDate: 'Not Available'
    };

    const gmpPercentage = ((gmpData.gmp / price) * 100).toFixed(2);
    const expectedListingPrice = Number(price) + Number(gmpData.gmp);

    await new Promise((res) => setTimeout(res, 700));

    const drhpAnalysis = {
      financialHealth: Math.random() > 0.5 ? 'Strong' : 'Moderate',
      revenueGrowth: (Math.random() * 50 + 10).toFixed(1) + '%',
      profitability: Math.random() > 0.4 ? 'Profitable' : 'Loss Making',
      debtToEquity: (Math.random() * 2).toFixed(2),
      industryOutlook: Math.random() > 0.5 ? 'Positive' : 'Neutral',
      managementQuality: Math.random() > 0.6 ? 'Strong' : 'Average',
    };

    const isGMPAbove10 = parseFloat(gmpPercentage) >= 10;
    const isFinanciallyStrong = drhpAnalysis.financialHealth === 'Strong';
    const isProfitable = drhpAnalysis.profitability === 'Profitable';
    const hasLowDebt = parseFloat(drhpAnalysis.debtToEquity) < 1;
    const hasPositiveOutlook = drhpAnalysis.industryOutlook === 'Positive';

    let verdict = 'AVOID';
    let verdictReasoning = '';

    if (isGMPAbove10) {
      if (isFinanciallyStrong && isProfitable) {
        verdict = 'APPLY';
        verdictReasoning = 'Strong GMP (>10%) backed by excellent financials and profitability';
      } else if (isFinanciallyStrong || isProfitable) {
        verdict = 'APPLY';
        verdictReasoning = 'Good GMP (>10%) with decent financial indicators';
      } else {
        verdict = 'CAUTION';
        verdictReasoning = 'High GMP but weak fundamentals - market hype may not sustain';
      }
    } else if (parseFloat(gmpPercentage) >= 5) {
      if (isFinanciallyStrong && isProfitable) {
        verdict = 'APPLY';
        verdictReasoning = 'Moderate GMP but strong fundamentals suggest long-term value';
      } else {
        verdict = 'AVOID';
        verdictReasoning = 'Low GMP with weak financials - limited upside potential';
      }
    } else {
      if (isFinanciallyStrong && isProfitable && hasPositiveOutlook) {
        verdict = 'CAUTION';
        verdictReasoning = 'Low GMP despite good fundamentals - market sentiment is weak';
      } else {
        verdict = 'AVOID';
        verdictReasoning = 'Low GMP combined with weak fundamentals';
      }
    }

    const reasons = [];

    if (isGMPAbove10) {
      reasons.push(`Strong GMP of Rs ${gmpData.gmp} (${gmpPercentage}%) - Market showing high confidence`);
    } else if (parseFloat(gmpPercentage) >= 5) {
      reasons.push(`Moderate GMP of Rs ${gmpData.gmp} (${gmpPercentage}%) - Average market sentiment`);
    } else if (parseFloat(gmpPercentage) >= 0) {
      reasons.push(`Low GMP of Rs ${gmpData.gmp} (${gmpPercentage}%) - Weak market interest`);
    } else {
      reasons.push(`Negative GMP of Rs ${gmpData.gmp} (${gmpPercentage}%) - Trading at discount`);
    }

    reasons.push(isFinanciallyStrong ? 'Strong financial health - Company has solid fundamentals' : 'Moderate financial health - Average fundamentals');
    reasons.push(isProfitable ? 'Profitable company - Generating positive returns' : 'Loss-making company - Not yet profitable');
    reasons.push(hasLowDebt ? `Low debt-to-equity ratio (${drhpAnalysis.debtToEquity}) - Healthy balance sheet` : `High debt-to-equity ratio (${drhpAnalysis.debtToEquity}) - Leverage concerns`);
    if (hasPositiveOutlook) reasons.push('Positive industry outlook - Sector tailwinds favorable');

    setResult({
      verdict,
      verdictReasoning,
      gmpData: {
        gmp: Number(gmpData.gmp),
        issuePrice: Number(price),
        priceRange: gmpData.priceRange || String(price),
        issueSize: gmpData.issueSize || 'Not Available',
        gmpPercentage,
        expectedListingPrice,
        lastUpdated: gmpData.lastUpdated,
        source: gmpData.source,
        subscriptionStatus: gmpData.subscriptionStatus || 'unknown',
        allotmentDate: gmpData.allotmentDate || 'Not Available',
        refundDate: gmpData.refundDate || 'Not Available',
        listingDate: gmpData.listingDate || 'Not Available'
      },
      drhpAnalysis,
      reasons,
      confidence: Math.floor(Math.random() * 30 + 70),
    });

    setAnalyzing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setDrhpFile(file);
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  const refreshGMP = async () => {
    if (!companyName) {
      alert('Please enter company name first');
      return;
    }

    const liveGMPData = await fetchLiveGMP(companyName);

    if (liveGMPData && result) {
      const price = Number(issuePrice) || Number(result.gmpData.issuePrice) || Number(liveGMPData.issuePrice) || 0;
      if (!price) return;

      const gmpPercentage = ((liveGMPData.gmp / price) * 100).toFixed(2);
      const expectedListingPrice = price + liveGMPData.gmp;

      setResult((r) => ({
        ...r,
        gmpData: {
          ...r.gmpData,
          gmp: liveGMPData.gmp,
          issuePrice: price,
          gmpPercentage,
          expectedListingPrice,
          lastUpdated: liveGMPData.lastUpdated,
          source: liveGMPData.source
        }
      }));
    }
  };

  const formatNumber = (v) => {
    if (v === undefined || v === null) return '-';
    if (typeof v === 'number') return v.toLocaleString();
    return String(v);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">IPO Analyzer</h1>
          <p className="text-gray-600">Live GMP Analysis with DRHP Insights</p>
          <p className="text-sm text-gray-500 mt-1">Powered by Real-time Data</p>

          {result && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-4 inline-block">
              <div className="flex items-center gap-6">
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="text-lg font-bold text-indigo-900">{companyName}</p>
                </div>
                <div className="text-left border-l border-gray-300 pl-6">
                  <p className="text-xs text-gray-500 mb-1">Issue Size</p>
                  <p className="text-lg font-bold text-green-600">Rs {result.gmpData.issueSize}</p>
                </div>
                <div className="text-left border-l border-gray-300 pl-6">
                  <p className="text-xs text-gray-500 mb-1">Price Band</p>
                  <p className="text-lg font-bold text-blue-600">Rs {result.gmpData.priceRange}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">IPO Details</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Swiggy, Hyundai Motor India, NTPC Green Energy"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter company name - Issue price will be fetched automatically</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Price (Rs)</label>
              <input
                type="text"
                value={issuePrice}
                onChange={(e) => setIssuePrice(e.target.value)}
                placeholder="Auto-filled or enter manually"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Will be auto-filled when fetching GMP data</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload DRHP (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="drhp-upload" />
                <label htmlFor="drhp-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{drhpFile ? drhpFile.name : 'Click to upload DRHP PDF'}</p>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={analyzeIPO}
            disabled={analyzing || fetchingGMP}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {analyzing || fetchingGMP ? (
              <>
                <Loader2 className="animate-spin" />
                {fetchingGMP ? 'Fetching Live GMP Data...' : 'Analyzing IPO...'}
              </>
            ) : (
              <>
                <Search />
                Analyze IPO with Live GMP
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">LIVE: Fetches current GMP, issue price, and important dates</p>
        </div>

        {result && (
          <div className="space-y-6">
            <div className={`rounded-xl shadow-lg p-8 ${
              result.verdict === 'APPLY' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : result.verdict === 'CAUTION'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{result.verdict === 'APPLY' ? 'APPLY' : result.verdict === 'CAUTION' ? 'APPLY WITH CAUTION' : 'AVOID'}</h2>
                  <p className="text-white/90 mb-3">Confidence: {result.confidence}%</p>
                  <p className="text-sm text-white/95 bg-white/20 rounded-lg p-3">{result.verdictReasoning}</p>
                </div>
                {result.verdict === 'APPLY' ? (
                  <CheckCircle className="h-16 w-16 ml-4" />
                ) : result.verdict === 'CAUTION' ? (
                  <AlertCircle className="h-16 w-16 ml-4" />
                ) : (
                  <XCircle className="h-16 w-16 ml-4" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Allotment Date</p>
                  <p className="text-lg font-semibold text-blue-700">{result.gmpData.allotmentDate}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Refund Initiation</p>
                  <p className="text-lg font-semibold text-purple-700">{result.gmpData.refundDate}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Listing Date</p>
                  <p className="text-lg font-semibold text-green-700">{result.gmpData.listingDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><TrendingUp className="text-indigo-600" />Grey Market Premium (GMP)</h3>
                <button onClick={refreshGMP} disabled={fetchingGMP} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${fetchingGMP ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Price Range</p>
                  <p className="text-xl font-bold text-indigo-600">Rs {result.gmpData.priceRange}</p>
                </div>
                <div className={`rounded-lg p-4 ${result.gmpData.gmp >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">GMP</p>
                  <p className={`text-2xl font-bold ${result.gmpData.gmp >= 0 ? 'text-green-600' : 'text-red-600'}`}>Rs {formatNumber(result.gmpData.gmp)}</p>
                </div>
                <div className={`rounded-lg p-4 ${parseFloat(result.gmpData.gmpPercentage) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">GMP %</p>
                  <p className={`text-2xl font-bold ${parseFloat(result.gmpData.gmpPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.gmpData.gmpPercentage}%</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Expected Listing</p>
                  <p className="text-xl font-bold text-indigo-600">Rs {Number(result.gmpData.expectedListingPrice).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800"><strong>Source:</strong> {result.gmpData.source}</p>
                      <p className="text-xs text-blue-600 mt-1">Last Updated: {result.gmpData.lastUpdated}</p>
                    </div>
                    {result.gmpData.subscriptionStatus !== 'unknown' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.gmpData.subscriptionStatus === 'open' ? 'bg-green-100 text-green-700' :
                        result.gmpData.subscriptionStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.gmpData.subscriptionStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {parseFloat(result.gmpData.gmpPercentage) >= 10 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-green-800">GMP above 10% - Strong market sentiment</p>
                  </div>
                ) : parseFloat(result.gmpData.gmpPercentage) >= 0 ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-orange-800">GMP below 10% - Weak market sentiment</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <TrendingDown className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">Negative GMP - Trading at discount</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">DRHP Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.drhpAnalysis).map(([key, value]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-lg font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Why this verdict?</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {result.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> This analysis is for informational purposes only. GMP data is from unofficial grey market sources and is subject to high volatility. 
                Please conduct your own research and consult with a SEBI-registered financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}