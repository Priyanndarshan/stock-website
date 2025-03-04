'use client'
import React, { useEffect, useState, useRef, memo } from 'react';

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

// TradingView Widget Component
const TradingViewWidget = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const container = useRef<HTMLDivElement>(null);

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
      "symbol": "NASDAQ:AAPL",
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
  }, [isDarkMode]);

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [chartHeight, setChartHeight] = useState('calc(90vh - 120px)');
  const tradingViewWindowRef = useRef<Window | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

    return () => {
      window.removeEventListener('resize', updateHeight);
      document.head.removeChild(styleElement);
    };
  }, []);

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
    
    // Open the actual TradingView website in a new window with dark theme
    const tvWindow = window.open(
      `https://www.tradingview.com/chart/?symbol=NASDAQ:AAPL&theme=dark`,
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

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white tracking-tight">
                Advanced Trading Platform
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Access your TradingView account and analyze markets in real-time
              </p>
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

              {!isLoggedIn && (
                <button 
                  type="button"
                  onClick={() => document.getElementById('loginModal')?.classList.remove('hidden')}
                  className="ml-4 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  Log In
                </button>
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
          <TradingViewWidget isDarkMode={isDarkMode} />
        </div>

        <div className="mt-6 text-sm text-center">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            {isLoggedIn 
              ? "You're logged in. Use all TradingView features in the chart above."
              : "Log in to access advanced features and save your preferences."}
          </p>
        </div>

        {/* Features List */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-semibold mb-4">Trading Features</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              With our integrated TradingView platform, you'll be able to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Log in to your TradingView account
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Access your personal charts and indicators
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Use all TradingView features
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Save and manage your trading strategies
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Seamlessly switch between chart view and full TradingView
              </li>
            </ul>
          </div>
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
          
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Log In</h3>
          
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
            
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Log In
            </button>
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
  );
};

export default ChartPage;
