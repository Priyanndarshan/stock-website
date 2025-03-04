'use client'
import React, { useEffect, useState, useRef, memo } from 'react';

declare global {
  interface Window {
    TradingView: any;
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
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "NASDAQ:AAPL",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": isDarkMode ? "dark" : "light",
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
      "backgroundColor": isDarkMode ? "#1e293b" : "#ffffff",
      "gridColor": isDarkMode ? "#334155" : "#f1f5f9",
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
    };
  }, [isDarkMode]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className={`tradingview-widget-copyright text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="text-blue-500 hover:text-blue-600">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

const Page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('theme-dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                Advanced Trading Platform
              </h1>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                Access your TradingView account and analyze markets in real-time
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                } shadow-md`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Welcome back!</span>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`mt-1 block w-full rounded-lg shadow-sm
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`mt-1 block w-full rounded-lg shadow-sm
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Sign In
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TradingView Chart Container */}
        <div className={`rounded-xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ height: 'calc(90vh - 120px)' }}>
          <TradingViewWidget isDarkMode={isDarkMode} />
        </div>

        <div className="mt-6 text-sm text-center">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            {isLoggedIn 
              ? "You're logged in. Use all TradingView features in the chart above."
              : "Log in to access advanced features and save your preferences."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
