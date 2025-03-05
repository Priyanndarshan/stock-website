'use client'
import React, { useEffect, useState, useRef, memo, createContext, useContext, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chat } from "@/components/Chat";
import { useChatContext } from "@/components/ChatContext";

declare global {
  interface Window {
    TradingView: any;
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

// Add custom CSS for theme colors
const customStyles = `
  :root:not(.theme-dark) {
    --tv-color-platform-background: #f8fafc;
    --tv-color-pane-background: #ffffff;
    --tv-color-toolbar-button-background-hover: #e2e8f0;
    --tv-color-toolbar-button-background-expanded: #e2e8f0;
    --tv-color-toolbar-button-background-active: #dbeafe;
    --tv-color-toolbar-button-background-active-hover: #bfdbfe;
    --tv-color-toolbar-button-text: #1e40af;
    --tv-color-toolbar-button-text-hover: #1e40af;
    --tv-color-toolbar-button-text-active: #2563eb;
    --tv-color-toolbar-button-text-active-hover: #3b82f6;
    --tv-color-item-active-text: #2563eb;
    --tv-color-toolbar-toggle-button-background-active: #2563eb;
    --tv-color-toolbar-toggle-button-background-active-hover: #3b82f6;
  }

  .theme-dark:root {
    --tv-color-platform-background: #0f172a;
    --tv-color-pane-background: #1e293b;
    --tv-color-toolbar-button-background-hover: #334155;
    --tv-color-toolbar-button-background-expanded: #334155;
    --tv-color-toolbar-button-background-active: #1e40af;
    --tv-color-toolbar-button-background-active-hover: #2563eb;
    --tv-color-toolbar-button-text: #e2e8f0;
    --tv-color-toolbar-button-text-hover: #f8fafc;
    --tv-color-toolbar-button-text-active: #bfdbfe;
    --tv-color-toolbar-button-text-active-hover: #dbeafe;
    --tv-color-item-active-text: #60a5fa;
    --tv-color-toolbar-toggle-button-background-active: #2563eb;
    --tv-color-toolbar-toggle-button-background-active-hover: #3b82f6;
  }
`;

// Symbol search helper function
const getValidTradingViewSymbol = (symbol?: string, name?: string): string => {
  // If we have a valid stock symbol, use it with proper formatting
  if (symbol && symbol.trim().length > 0) {
    // Check if symbol already has an exchange prefix
    if (symbol.includes(':')) {
      return symbol.trim();
    }
    // Add NASDAQ as default exchange if needed
    return `NASDAQ:${symbol.trim().toUpperCase()}`;
  }
  
  // If we only have a name, use it as a search term
  if (name && name.trim().length > 0) {
    return name.trim();
  }
  
  // Default fallback
  return "NASDAQ:AAPL";
};

// Define the interface for TradingView live data
interface LiveChartData {
  currentPrice?: string;
  dayChange?: string;
  dayChangePercent?: string;
  volume?: string;
  timestamp?: string;
  support?: string;
  resistance?: string;
  trend?: string;
}

// Create a context to share live data
const LiveChartDataContext = createContext<{
  liveData: LiveChartData;
  updateLiveData: (data: LiveChartData) => void;
}>({
  liveData: {},
  updateLiveData: () => {}
});

// Hook to access live chart data
export const useLiveChartData = () => useContext(LiveChartDataContext);

// TradingView Widget Component
const TradingViewWidget = memo(({ isDarkMode, symbol, stockName }: { isDarkMode: boolean; symbol?: string; stockName?: string }) => {
  const container = useRef<HTMLDivElement>(null);
  const [resolvedSymbol, setResolvedSymbol] = useState<string>(getValidTradingViewSymbol(symbol, stockName));
  
  // Access the context to update live data
  const { updateLiveData } = useLiveChartData();
  
  // Function to extract data from Trading View widget
  const extractLiveData = useCallback(() => {
    try {
      console.log('Attempting to extract live chart data...');
      
      // Helper function to safely extract numeric values
      const extractNumber = (text: string | undefined | null): string | undefined => {
        if (!text) return undefined;
        const match = text.match(/[\d,]+\.?\d*/);
        return match ? match[0].replace(/,/g, '') : undefined;
      };
      
      // Try multiple selectors for each data point for better reliability
      
      // Current price - try multiple potential selectors
      let currentPrice: string | undefined;
      const priceSelectors = [
        '.sidebar-price',
        '.tv-symbol-price-quote__value',
        '.tv-symbol-header__first-line span',
        '[data-name="legend-series-item"] [data-name="legend-price-value"]'
      ];
      
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          currentPrice = extractNumber(element.textContent.trim());
          console.log(`Found price using selector ${selector}: ${currentPrice}`);
          break;
        }
      }
      
      // Try to get data from TradingView iframe if direct selectors fail
      if (!currentPrice) {
        const tradingViewIframe = document.querySelector('iframe[id^="tradingview"]');
        if (tradingViewIframe) {
          try {
            const iframeDocument = (tradingViewIframe as HTMLIFrameElement).contentDocument;
            if (iframeDocument) {
              for (const selector of priceSelectors) {
                const element = iframeDocument.querySelector(selector);
                if (element?.textContent) {
                  currentPrice = extractNumber(element.textContent.trim());
                  console.log(`Found price in iframe using selector ${selector}: ${currentPrice}`);
                  break;
                }
              }
            }
          } catch (e) {
            console.log('Could not access iframe content due to same-origin policy');
          }
        }
      }
      
      // Volume - try multiple selectors
      let volume: string | undefined;
      const volumeSelectors = [
        '.sidebar-volume',
        '.tv-symbol-volume',
        '[data-name="legend-volume-value"]'
      ];
      
      for (const selector of volumeSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          volume = element.textContent.trim();
          break;
        }
      }
      
      // Support and resistance - use sidebar or estimate from chart
      const support = document.querySelector('.sidebar-support')?.textContent?.trim() || "N/A";
      const resistance = document.querySelector('.sidebar-resistance')?.textContent?.trim() || "N/A";
      
      // Trend - determine from price movement or use default
      let trend = document.querySelector('.sidebar-trend')?.textContent?.trim();
      
      // If we have a price but no trend, try to determine from price change element
      if (!trend && currentPrice) {
        const changeElement = document.querySelector('.tv-symbol-price-quote__change');
        if (changeElement) {
          const changeText = changeElement.textContent;
          if (changeText && changeText.includes('-')) {
            trend = 'Downtrend';
          } else if (changeText && !changeText.includes('0.00')) {
            trend = 'Uptrend';
          } else {
            trend = 'Sideways';
          }
        } else {
          trend = 'Sideways'; // Default if we can't determine
        }
      }
      
      // Get day change from TradingView if available
      let dayChange: string | undefined;
      let dayChangePercent: string | undefined;
      
      const changeSelectors = [
        '.tv-symbol-price-quote__change',
        '.tv-symbol-header__second-line span'
      ];
      
      for (const selector of changeSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          const changeText = element.textContent.trim();
          // Extract numeric change value
          const changeMatch = changeText.match(/([+-]?[\d,]+\.?\d*)/);
          if (changeMatch) {
            dayChange = changeMatch[1];
          }
          
          // Extract percentage
          const percentMatch = changeText.match(/\((.*?)\)/);
          if (percentMatch) {
            dayChangePercent = percentMatch[1];
          }
          
          if (dayChange || dayChangePercent) {
            console.log(`Found change data using selector ${selector}: ${changeText}`);
            break;
          }
        }
      }
      
      // If we couldn't get day change from the widget, calculate a simulated one
      if ((!dayChange || !dayChangePercent) && currentPrice && support && support !== "N/A") {
        console.log('Calculating simulated day change based on support level');
        dayChange = currentPrice && support !== "N/A" ? 
          `${(parseFloat(currentPrice) - parseFloat(support)).toFixed(2)}` : "0.00";
        
        dayChangePercent = currentPrice && support !== "N/A" ? 
          `${(((parseFloat(currentPrice) - parseFloat(support)) / parseFloat(support)) * 100).toFixed(2)}%` : "0.00%";
      }
      
      console.log('Extracted data from TradingView:', {
        currentPrice, volume, support, resistance, trend,
        dayChange, dayChangePercent
      });
      
      const data: LiveChartData = {
        currentPrice: currentPrice || "N/A",
        volume: volume || "N/A",
        support,
        resistance, 
        trend: trend || "Sideways",
        dayChange: dayChange || "0.00",
        dayChangePercent: dayChangePercent || "0.00%",
        timestamp: new Date().toISOString()
      };
      
      // Update the context with the new data
      updateLiveData(data);
    } catch (error) {
      console.error('Error extracting live data:', error);
    }
  }, [updateLiveData]);
  
  // Set up periodic data extraction
  useEffect(() => {
    console.log('Setting up live data extraction...');
    
    // Initial extraction after a delay to allow widget to load
    const initialTimer = setTimeout(() => {
      extractLiveData();
      
      // Additional extraction attempts at different intervals for reliability
      setTimeout(extractLiveData, 2000);
      setTimeout(extractLiveData, 5000);
    }, 3000);
    
    // Set up interval for periodic updates
    const intervalTimer = setInterval(extractLiveData, 10000); // Extract every 10 seconds
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [extractLiveData]);

  useEffect(() => {
    // Update the resolved symbol when props change
    setResolvedSymbol(getValidTradingViewSymbol(symbol, stockName));
  }, [symbol, stockName]);

  useEffect(() => {
    // Add custom styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": resolvedSymbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": true,
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": true,
      "calendar": true,
      "news": ["headlines"],
      "studies": [
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies"
      ],
      "support_host": "https://www.tradingview.com",
      "container_id": "tradingview_chart",
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "enable_signin_button": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": true,
      "backgroundColor": "#1e293b",
      "gridColor": "#334155",
      "widgetbar": {
        "details": true,
        "news": true,
        "watchlist": true,
        "datawindow": true,
        "economic": true
      }
    });

    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isDarkMode, resolvedSymbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright text-xs text-gray-400">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="text-blue-500 hover:text-blue-600">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

const ChartPage = () => {
  // NOTE: All state is only stored in memory and is NOT persisted in localStorage or any other storage mechanism.
  // Data is cleared when the page is refreshed or closed.
  const searchParams = useSearchParams();
  const symbol = searchParams ? searchParams.get('symbol') : null;
  const stockName = searchParams ? searchParams.get('name') : null;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [chartHeight, setChartHeight] = useState('calc(90vh - 120px)');
  const tradingViewWindowRef = useRef<Window | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const { clearMessages } = useChatContext();
  const previousSymbolRef = useRef<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Live chart data state
  const [liveChartData, setLiveChartData] = useState<LiveChartData>({});
  
  // Function to update live chart data
  const updateLiveData = useCallback((data: LiveChartData) => {
    setLiveChartData(data);
    
    // Also update the analysis object with live data for the chat
    setAnalysis((prevAnalysis: any) => {
      if (!prevAnalysis) return prevAnalysis;
      
      return {
        ...prevAnalysis,
        // Update with real-time data if available
        currentPrice: data.currentPrice || prevAnalysis.currentPrice,
        volume: data.volume || prevAnalysis.volume,
        // Add additional live data
        dayChange: data.dayChange,
        dayChangePercent: data.dayChangePercent,
        lastUpdated: data.timestamp,
        isLiveData: true
      };
    });
  }, []);

  // For the window opening functionality
  const updateHeight = () => {
    const windowHeight = window.innerHeight;
    setChartHeight(`${windowHeight - 200}px`);
  };

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Add custom styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    // Set dark theme on mount
    document.documentElement.classList.add('theme-dark');
    
    // Create an analysis object from the URL parameters for the Chat component
    if (symbol && stockName) {
      // If navigating to a different stock, clear the chat history
      if (previousSymbolRef.current && previousSymbolRef.current !== symbol) {
        clearMessages();
      }
      
      // Update the previous symbol reference
      previousSymbolRef.current = symbol;
      
      setAnalysis({
        stockName: stockName,
        stockSymbol: symbol,
        // Add any other fields that are required for the Chat to work
        currentPrice: "N/A",
        weekRange: "N/A",
        volume: "N/A",
        peRatio: "N/A",
        support: "N/A",
        resistance: "N/A",
        trend: "Sideways",
        strategies: {
          shortTerm: "Continue monitoring the chart for trading opportunities.",
          mediumTerm: "Follow market trends and adjust your position accordingly.",
          longTerm: "Consider the company fundamentals for long-term investment decisions."
        },
        recommendation: "View the live chart for the most current information."
      });
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      document.head.removeChild(styleElement);
    };
  }, [symbol, stockName, clearMessages]);

  // Effect to handle welcome screen and analyze URL params
  useEffect(() => {
    // Check if there are URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('symbol')) {
        // Get current symbol
        const currentSymbol = params.get('symbol');
        
        // If symbol changed and we have a previous symbol, clear chat history
        if (previousSymbolRef.current && currentSymbol !== previousSymbolRef.current) {
          clearMessages();
        }
        
        // Update the ref with current symbol
        previousSymbolRef.current = currentSymbol;
      }
    }
  }, [clearMessages]);

  // Create analysis object from URL parameters and sidebar data
  useEffect(() => {
    if (typeof window !== 'undefined' && symbol) {
      // Extract data from search params
      const params = new URLSearchParams(window.location.search);
      
      // Add a slight delay to ensure DOM elements are available
      const timer = setTimeout(() => {
        // Get values from DOM elements
        const currentPrice = document.querySelector('.sidebar-price')?.textContent?.trim() || 'N/A';
        const trend = document.querySelector('.sidebar-trend')?.textContent?.trim() || 'sideways pattern';
        const support = document.querySelector('.sidebar-support')?.textContent?.trim() || 'N/A';
        const resistance = document.querySelector('.sidebar-resistance')?.textContent?.trim() || 'N/A';
        const volume = document.querySelector('.sidebar-volume')?.textContent?.trim() || 'N/A';
        const peRatio = document.querySelector('.sidebar-pe')?.textContent?.trim() || 'N/A';
        
        // Create analysis object with data from search params and element references
        const currentAnalysis = {
          name: stockName || 'Apple Inc',
          stockName: stockName || 'Apple Inc',
          stockSymbol: symbol || 'AAPL',
          currentPrice: currentPrice,
          trend: trend,
          support: support,
          resistance: resistance,
          volume: volume,
          peRatio: peRatio,
          weekRange: "N/A", // Add this to match API expectations
          strategies: {
            shortTerm: "Monitor key support/resistance levels",
            mediumTerm: "Follow the overall market trend",
            longTerm: "Consider fundamentals for long-term position"
          },
          recommendation: 'View the live chart for the most current information'
        };
        
        setAnalysis(currentAnalysis);
      }, 500); // 500ms delay
      
      return () => clearTimeout(timer);
    }
  }, [symbol, stockName]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // Open TradingView in a proper popup window
  const openTradingViewWindow = () => {
    const width = Math.min(1200, window.screen.width * 0.9);
    const height = Math.min(800, window.screen.height * 0.9);
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Use the resolved symbol for opening the popup
    const searchTerm = getValidTradingViewSymbol(symbol || undefined, stockName || undefined);
    
    // Open the actual TradingView website in a new window with dark theme
    const tvWindow = window.open(
      `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(searchTerm)}&theme=dark`,
      'TradingViewPopup',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes,toolbar=yes,menubar=yes,location=yes`
    );
    
    if (tvWindow) {
      tradingViewWindowRef.current = tvWindow;
      setIsPopupOpen(true);
      
      // Focus the window
      tvWindow.focus();
      
      // Set up a check to determine if popup was closed
      const checkIfClosed = setInterval(() => {
        if (tradingViewWindowRef.current && tradingViewWindowRef.current.closed) {
          clearInterval(checkIfClosed);
          setIsPopupOpen(false);
        }
      }, 1000);
    } else {
      alert("Your browser blocked the popup. Please allow popups for this site to use this feature.");
    }
  };
  
  // Bring focus to the TradingView window
  const focusTradingViewWindow = () => {
    if (tradingViewWindowRef.current && !tradingViewWindowRef.current.closed) {
      tradingViewWindowRef.current.focus();
    } else {
      // If window is closed or not available, ask to open it
      if (confirm('The TradingView window is not open. Would you like to open it now?')) {
        openTradingViewWindow();
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <LiveChartDataContext.Provider value={{ liveData: liveChartData, updateLiveData }}>
      <div className="min-h-screen transition-colors duration-200 bg-gray-900 flex overflow-hidden">
        {/* Chat Sidebar */}
        <div 
          className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 z-10 w-[400px] transition-all duration-300 shadow-xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ height: '100vh' }}
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                Chat Assistant
              </h2>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <Chat analysis={analysis} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-[400px]' : 'ml-0'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <header className="mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  {!isSidebarOpen && (
                    <button 
                      onClick={toggleSidebar}
                      className="mr-4 p-2 rounded-lg hover:bg-gray-800/70 text-gray-300 border border-gray-700 bg-gray-800/30 transition-all duration-200"
                      title="Open Chat"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="ml-2 text-sm font-medium hidden sm:inline">Chat</span>
                      </div>
                    </button>
                  )}
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white tracking-tight">
                      Roar AI Chart Analysis
                    </h1>
                    <p className="text-sm sm:text-base text-gray-300">
                      {stockName ? `Viewing: ${stockName}` : 'Access your TradingView account and analyze markets in real-time'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {!isPopupOpen ? (
                    <button 
                      onClick={openTradingViewWindow}
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                      Open TradingView
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={focusTradingViewWindow}
                        className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                        </svg>
                        Focus TradingView
                      </button>
                      <button 
                        onClick={openTradingViewWindow}
                        className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Window
                      </button>
                    </div>
                  )}

                  {isLoggedIn && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {username.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {username || 'User'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* TradingView Chart Container */}
            <div className={`rounded-xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ height: chartHeight }}>
              <TradingViewWidget isDarkMode={isDarkMode} symbol={symbol || undefined} stockName={stockName || undefined} />
            </div>

            {/* Key Insights Section */}
          </div>
        </div>

        {/* Login Modal */}
        <div id="loginModal" className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center hidden">
          <div className={`relative bg-white dark:bg-gray-800 w-full max-w-md mx-4 rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button 
              onClick={() => document.getElementById('loginModal')?.classList.add('hidden')}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="username" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
            </form>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </LiveChartDataContext.Provider>
  );
};

export default ChartPage;
