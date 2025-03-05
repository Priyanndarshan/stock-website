"use client"
import React, { useEffect, useState, useCallback } from "react";

const TradingViewPage = () => {
  const [iframeHeight, setIframeHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tradingViewWindow, setTradingViewWindow] = useState<Window | null>(null);

  // Function to calculate and set iframe height
  const updateHeight = () => {
    const headerHeight = 100;
    const padding = 48;
    const margins = 40;
    const availableHeight = window.innerHeight - headerHeight - padding - margins;
    const height = Math.max(500, Math.min(availableHeight, 1000));
    setIframeHeight(height);
  };

  // Function to open TradingView in a popup
  const openTradingView = useCallback(() => {
    const width = Math.min(window.innerWidth * 0.9, 1200);
    const height = Math.min(window.innerHeight * 0.9, 800);
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const newWindow = window.open(
      'https://www.tradingview.com/chart',
      'TradingView',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (newWindow) {
      setTradingViewWindow(newWindow);
      newWindow.focus();

      // Check if window is closed
      const checkWindow = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkWindow);
          setTradingViewWindow(null);
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Close popup when component unmounts
  useEffect(() => {
    return () => {
      if (tradingViewWindow && !tradingViewWindow.closed) {
        tradingViewWindow.close();
      }
    };
  }, [tradingViewWindow]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <header className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">Advanced Trading Platform</h1>
            <p className="text-sm sm:text-base text-slate-600">Access your TradingView account and analyze markets in real-time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openTradingView}
              className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              {tradingViewWindow ? 'TradingView Open' : 'Open TradingView'}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Welcome to Your Trading Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Click the button above to open TradingView in a new window. You'll be able to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
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
            </ul>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 text-center">
          <p>The TradingView window will open in a new window while keeping you on our platform.</p>
        </div>
      </div>
    </div>
  );
};

export default TradingViewPage;
