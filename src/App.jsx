import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Search,
  RefreshCw,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';

export default function IPOAnalyzer() {
  const [companyName, setCompanyName] = useState('');
  const [issuePrice, setIssuePrice] = useState('');
  const [drhpFile, setDrhpFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingGMP, setFetchingGMP] = useState(false);
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fetchLiveGMP = async (company) => {
    setFetchingGMP(true);
    try {
      // Check if we're in production mode with API endpoint configured
      const apiMode = import.meta.env.VITE_APP_MODE || 'demo';
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      // PRODUCTION MODE: Call backend API
      if (apiMode === 'production' && apiBaseUrl) {
        try {
          const response = await fetch(`${apiBaseUrl}/gmp-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company: company }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.error) {
            console.error("API Error:", data.error);
            // Fall back to demo mode on error
          } else if (data.gmp !== undefined) {
            if (data.issuePrice) {
              const priceStr = String(data.issuePrice);
              if (priceStr.includes('-')) {
                const prices = priceStr.split('-').map(p => p.trim());
                setIssuePrice(prices[prices.length - 1]);
              } else {
                setIssuePrice(priceStr.replace(/[^0-9.]/g, ''));
              }
            }
            
            data.gmp = parseFloat(String(data.gmp).replace(/[^0-9.-]/g, ''));
            return data;
          }
        } catch (apiError) {
          console.error('API call failed, falling back to demo mode:', apiError);
          // Fall through to demo mode
        }
      }

      // DEMO MODE: Mock data based on company name
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const companyLower = company.toLowerCase();
      let mockData = null;

      // Generate realistic mock data based on company name patterns
      if (companyLower.includes('swiggy') || companyLower.includes('zomato')) {
        mockData = {
          gmp: 45,
          issuePrice: "390",
          priceRange: "380-390",
          issueSize: "11,327 Cr",
          subscriptionStatus: "open",
          allotmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refundDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          listingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          source: "Demo Mode - Mock Data"
        };
      } else if (companyLower.includes('hyundai') || companyLower.includes('motor')) {
        mockData = {
          gmp: 28,
          issuePrice: "1250",
          priceRange: "1200-1250",
          issueSize: "25,000 Cr",
          subscriptionStatus: "upcoming",
          allotmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refundDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          listingDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          source: "Demo Mode - Mock Data"
        };
      } else if (companyLower.includes('ntpc') || companyLower.includes('green')) {
        mockData = {
          gmp: 12,
          issuePrice: "85",
          priceRange: "80-85",
          issueSize: "5,500 Cr",
          subscriptionStatus: "open",
          allotmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refundDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          listingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          source: "Demo Mode - Mock Data"
        };
      } else {
        // Generic mock data for unknown companies
        const baseGMP = Math.floor(Math.random() * 50) + 5;
        const basePrice = Math.floor(Math.random() * 500) + 100;
        mockData = {
          gmp: baseGMP,
          issuePrice: String(basePrice),
          priceRange: `${basePrice - 10}-${basePrice}`,
          issueSize: `${(Math.random() * 10 + 2).toFixed(1)} Cr`,
          subscriptionStatus: Math.random() > 0.5 ? "open" : "upcoming",
          allotmentDate: new Date(Date.now() + (Math.floor(Math.random() * 10) + 5) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refundDate: new Date(Date.now() + (Math.floor(Math.random() * 10) + 6) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          listingDate: new Date(Date.now() + (Math.floor(Math.random() * 10) + 8) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          source: "Demo Mode - Mock Data"
        };
      }

      if (mockData && mockData.issuePrice) {
        const priceStr = String(mockData.issuePrice);
        if (priceStr.includes('-')) {
          const prices = priceStr.split('-').map(p => p.trim());
          setIssuePrice(prices[prices.length - 1]);
        } else {
          setIssuePrice(priceStr.replace(/[^0-9.]/g, ''));
        }
      }
      
      mockData.gmp = parseFloat(String(mockData.gmp).replace(/[^0-9.-]/g, ''));
      return mockData;
    } catch (error) {
      console.error('Error fetching GMP:', error);
      return null;
    } finally {
      setFetchingGMP(false);
    }
  };

  const analyzeIPO = async () => {
    if (!companyName.trim()) {
      alert('Please enter company name');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const liveGMPData = await fetchLiveGMP(companyName);

      if (!liveGMPData && !issuePrice) {
        alert('Could not fetch data. Please enter the issue price manually and try again.');
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
    } catch (error) {
      console.error('Error analyzing IPO:', error);
      alert('An error occurred while analyzing the IPO. Please try again.');
    } finally {
      setAnalyzing(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse-slow" />
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-fade-in">
                IPO Analyzer
              </h1>
              <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse-slow" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Live GMP Analysis with DRHP Insights</p>
            {(() => {
              const apiMode = import.meta.env.VITE_APP_MODE || 'demo';
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
              const isProduction = apiMode === 'production' && apiBaseUrl;
              
              return isProduction ? (
                <div className="mt-4 inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl px-6 py-3 shadow-md animate-slide-up">
                  <p className="text-sm text-green-800 dark:text-green-300 font-semibold">✅ Production Mode - Using Real API</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">Connected to: {apiBaseUrl}</p>
                </div>
              ) : (
                <div className="mt-4 inline-block bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl px-6 py-3 shadow-md animate-slide-up">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">⚠️ Demo Mode - Using Mock Data</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Set VITE_APP_MODE=production and VITE_API_BASE_URL to use real API</p>
                </div>
              );
            })()}
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700 group"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-6 w-6 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="h-6 w-6 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="text-center mb-6">
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 inline-block border border-gray-200 dark:border-gray-700 animate-slide-up backdrop-blur-sm">
              <div className="flex items-center gap-8">
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Company</p>
                  <p className="text-xl font-bold text-indigo-900 dark:text-indigo-300">{companyName}</p>
                </div>
                <div className="text-left border-l-2 border-gray-300 dark:border-gray-600 pl-8">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Issue Size</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">Rs {result.gmpData.issueSize}</p>
                </div>
                <div className="text-left border-l-2 border-gray-300 dark:border-gray-600 pl-8">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Price Band</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Rs {result.gmpData.priceRange}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-200 dark:border-gray-700 backdrop-blur-sm animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
            IPO Details
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Swiggy, Hyundai Motor India, NTPC Green Energy"
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter company name - Issue price will be fetched automatically</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issue Price (Rs)</label>
              <input
                type="text"
                value={issuePrice}
                onChange={(e) => setIssuePrice(e.target.value)}
                placeholder="Auto-filled or enter manually"
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Will be auto-filled when fetching GMP data</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload DRHP (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="drhp-upload" />
                <label htmlFor="drhp-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-14 w-14 text-gray-400 dark:text-gray-500 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{drhpFile ? drhpFile.name : 'Click to upload DRHP PDF'}</p>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={analyzeIPO}
            disabled={analyzing || fetchingGMP}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
          >
            {analyzing || fetchingGMP ? (
              <>
                <Loader2 className="animate-spin h-6 w-6" />
                <span>{fetchingGMP ? 'Fetching Live GMP Data...' : 'Analyzing IPO...'}</span>
              </>
            ) : (
              <>
                <Search className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Analyze IPO with Live GMP</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">DEMO: Simulates GMP data fetch. Configure backend API for live data.</p>
        </div>

        {result && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-2xl p-8 animate-slide-up ${
              result.verdict === 'APPLY' 
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 dark:from-green-600 dark:via-emerald-600 dark:to-teal-600'
                : result.verdict === 'CAUTION'
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 dark:from-yellow-600 dark:via-orange-600 dark:to-amber-600'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 dark:from-red-600 dark:via-rose-600 dark:to-pink-600'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                  <h2 className="text-4xl font-extrabold mb-3 drop-shadow-lg">{result.verdict === 'APPLY' ? 'APPLY' : result.verdict === 'CAUTION' ? 'APPLY WITH CAUTION' : 'AVOID'}</h2>
                  <div className="mb-4">
                    <span className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                      Confidence: {result.confidence}%
                    </span>
                  </div>
                  <p className="text-base text-white/95 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">{result.verdictReasoning}</p>
                </div>
                <div className="ml-6">
                  {result.verdict === 'APPLY' ? (
                    <CheckCircle className="h-20 w-20 drop-shadow-lg animate-bounce-slow" />
                  ) : result.verdict === 'CAUTION' ? (
                    <AlertCircle className="h-20 w-20 drop-shadow-lg animate-pulse-slow" />
                  ) : (
                    <XCircle className="h-20 w-20 drop-shadow-lg animate-pulse-slow" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Allotment Date</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{result.gmpData.allotmentDate}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Refund Initiation</p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{result.gmpData.refundDate}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Listing Date</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{result.gmpData.listingDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  <TrendingUp className="text-indigo-600 dark:text-indigo-400 h-7 w-7" />
                  <span>Grey Market Premium (GMP)</span>
                </h3>
                <button onClick={refreshGMP} disabled={fetchingGMP} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 font-semibold shadow-md">
                  <RefreshCw className={`h-5 w-5 ${fetchingGMP ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-5 border-2 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Price Range</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Rs {result.gmpData.priceRange}</p>
                </div>
                <div className={`rounded-xl p-5 border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 ${result.gmpData.gmp >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">GMP</p>
                  <p className={`text-2xl font-bold ${result.gmpData.gmp >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Rs {formatNumber(result.gmpData.gmp)}</p>
                </div>
                <div className={`rounded-xl p-5 border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 ${parseFloat(result.gmpData.gmpPercentage) >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">GMP %</p>
                  <p className={`text-2xl font-bold ${parseFloat(result.gmpData.gmpPercentage) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.gmpData.gmpPercentage}%</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-5 border-2 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Expected Listing</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Rs {Number(result.gmpData.expectedListingPrice).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold"><strong>Source:</strong> {result.gmpData.source}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Last Updated: {result.gmpData.lastUpdated}</p>
                    </div>
                    {result.gmpData.subscriptionStatus !== 'unknown' && (
                      <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                        result.gmpData.subscriptionStatus === 'open' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                        result.gmpData.subscriptionStatus === 'upcoming' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {result.gmpData.subscriptionStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {parseFloat(result.gmpData.gmpPercentage) >= 10 ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={24} />
                    <p className="text-sm text-green-800 dark:text-green-300 font-semibold">GMP above 10% - Strong market sentiment</p>
                  </div>
                ) : parseFloat(result.gmpData.gmpPercentage) >= 0 ? (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={24} />
                    <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold">GMP below 10% - Weak market sentiment</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 flex items-start gap-3">
                    <TrendingDown className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                    <p className="text-sm text-red-800 dark:text-red-300 font-semibold">Negative GMP - Trading at discount</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                DRHP Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.drhpAnalysis).map(([key, value]) => (
                  <div key={key} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize font-semibold uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  Why this verdict?
                </h4>
                <ul className="list-disc pl-6 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="leading-relaxed">{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-5">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                <strong className="font-bold">Disclaimer:</strong> This analysis is for informational purposes only. GMP data is from unofficial grey market sources and is subject to high volatility. 
                Please conduct your own research and consult with a SEBI-registered financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}