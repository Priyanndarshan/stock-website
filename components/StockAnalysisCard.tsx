import { Card } from "./ui/card";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { TrendingUp, TrendingDown, MinusCircle, BarChart2, DollarSign, Activity } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";

interface StockAnalysis {
  stockName: string;
  currentPrice: string;
  weekRange: string;
  volume: string;
  peRatio: string;
  support: string;
  resistance: string;
  trend: "Uptrend" | "Downtrend" | "Sideways";
  strategies: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  recommendation: string;
}

export function StockAnalysisCard({ analysis }: { analysis: StockAnalysis }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getTrendIcon = () => {
    switch (analysis.trend) {
      case "Uptrend":
        return <TrendingUp className="h-6 w-6 text-green-400" />;
      case "Downtrend":
        return <TrendingDown className="h-6 w-6 text-red-400" />;
      default:
        return <MinusCircle className="h-6 w-6 text-yellow-400" />;
    }
  };

  const formatStrategy = (strategy: string) => {
    return strategy.split('. ').filter(Boolean).map((point, index) => (
      <li key={index} className="mb-3">
        {point.trim()}
      </li>
    ));
  };

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content */}
      <motion.div
        animate={{ 
          marginLeft: isSidebarOpen ? "280px" : "0px",
          width: isSidebarOpen ? "calc(100% - 280px)" : "100%"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen bg-white"
      >
        {/* Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="space-y-4">
          <CollapsiblePanel title="Key Insights">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 pl-2">
                {getTrendIcon()}
                <div className="flex-1">
                  <div className="text-sm text-gray-400">Trend</div>
                  <div className="text-lg font-medium">{analysis.trend}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <BarChart2 className="h-6 w-6 text-blue-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400">Volume</div>
                  <div className="text-lg font-medium">{analysis.volume}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <DollarSign className="h-6 w-6 text-green-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-lg font-medium">{analysis.currentPrice}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <Activity className="h-6 w-6 text-purple-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400">P/E Ratio</div>
                  <div className="text-lg font-medium">{analysis.peRatio}</div>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel title="Trading Strategies">
            <div className="space-y-6">
              <div>
                <h3 className="text-green-400 font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Short-Term (1-3 months)
                </h3>
                <ul className="text-gray-300 text-sm leading-relaxed list-disc pl-4">
                  {formatStrategy(analysis.strategies.shortTerm)}
                </ul>
              </div>
              <div>
                <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Medium-Term (3-6 months)
                </h3>
                <ul className="text-gray-300 text-sm leading-relaxed list-disc pl-4">
                  {formatStrategy(analysis.strategies.mediumTerm)}
                </ul>
              </div>
              <div>
                <h3 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Long-Term (6+ months)
                </h3>
                <ul className="text-gray-300 text-sm leading-relaxed list-disc pl-4">
                  {formatStrategy(analysis.strategies.longTerm)}
                </ul>
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel title="Final Recommendation">
            <p className="text-gray-300 leading-relaxed pl-2">
              {analysis.recommendation}
            </p>
          </CollapsiblePanel>
        </div>
      </motion.div>
    </div>
  );
}

export default StockAnalysisCard; 