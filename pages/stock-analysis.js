import { useState } from 'react';
import axios from 'axios';

const StockAnalysis = () => {
  const [chartData, setChartData] = useState(null);
  const [keyInsights, setKeyInsights] = useState(null);
  const [tradingStrategies, setTradingStrategies] = useState(null);
  const [financialRecommendations, setFinancialRecommendations] = useState(null);
  const [news, setNews] = useState(null);

  const analyzeChart = async (image) => {
    try {
      const response = await axios.post('https://api.gemini.com/v1/analyze', {
        image,
        apiKey: 'YOUR_GEMINI_API_KEY',
      });
      setChartData(response.data.chart);
      setKeyInsights(response.data.insights);
      setTradingStrategies(response.data.strategies);
      setFinancialRecommendations(response.data.recommendations);
      setNews(response.data.news);
    } catch (error) {
      console.error('Error analyzing chart:', error);
    }
  };

  return (
    <div className="main-container">
      <div className="sidebar p-4">
        {/* Centered heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-transparent text-primary">Chat with Chart AI</h1>
        </div>
        
        <div className="content-wrapper">
          {/* Upload section with dashed border */}
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 mb-4 text-center cursor-pointer">
            <input type="file" className="hidden" onChange={(e) => analyzeChart(e.target.files[0])} />
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span className="text-gray-400 bg-transparent">Click or drag and drop</span>
              <span className="text-sm text-gray-500 bg-transparent">Screenshot 2025-02-25 114821.png</span>
            </div>
          </div>

          {/* Analyze Button */}
          <button 
            className="w-full analyze-button"
            onClick={() => analyzeChart()}
            style={{ backgroundColor: '#2563eb' }}
          >
            Analyze Chart
          </button>

          {/* Cards container */}
          <div className="cards-container">
            <div className="collapsible-card">
              <h2 className="text-xl bg-transparent">Chart Preview</h2>
              {chartData && <img src={chartData} alt="Chart Preview" />}
            </div>

            <div className="collapsible-card">
              <h2 className="text-xl bg-transparent">Key Insights</h2>
              {keyInsights && <p>{keyInsights}</p>}
            </div>

            <div className="collapsible-card">
              <h2 className="text-xl bg-transparent">Trading Strategies</h2>
              {tradingStrategies && <p>{tradingStrategies}</p>}
            </div>

            <div className="final-section-wrapper flex-1">
              <div className="collapsible-card">
                <h2 className="text-xl bg-transparent">Final Recommendation</h2>
                {financialRecommendations && <p>{financialRecommendations}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis; 