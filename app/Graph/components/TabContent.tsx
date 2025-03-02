"use client"

import React from 'react';

// Tab Content Components
import ChartTabContent from './TabContents/ChartTabContent';
import TechnicalTabContent from './TabContents/TechnicalTabContent';
import FundamentalTabContent from './TabContents/FundamentalTabContent';
import NewsTabContent from './TabContents/NewsTabContent';

interface TabContentProps {
    selectedTab: string;
    colorScheme: any;
    transitions: any;
    symbol: string;
    stockInfo: any;
    compareSymbols: string[];
    removeCompareSymbol: (symbol: string) => void;
    newsData: any[];
    indicators: string[];
    drawingTools: string[];
    isDarkMode: boolean;
}

const TabContent: React.FC<TabContentProps> = ({
    selectedTab,
    colorScheme,
    transitions,
    symbol,
    stockInfo,
    compareSymbols,
    removeCompareSymbol,
    newsData,
    indicators,
    drawingTools,
    isDarkMode,
}) => {
    return (
        <div style={{ 
            backgroundColor: colorScheme.cardBg, 
            padding: "20px",
            borderRadius: "8px",
            marginTop: selectedTab === "news" ? "0" : "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            ...(selectedTab === "news" ? {
                ...transitions.slideIn,
                minHeight: "600px",
            } : transitions.slideInFromRight)
        }}>
            {selectedTab === "chart" && (
                <ChartTabContent 
                    drawingTools={drawingTools}
                    compareSymbols={compareSymbols}
                    removeCompareSymbol={removeCompareSymbol}
                    stockInfo={stockInfo}
                    colorScheme={colorScheme}
                    isDarkMode={isDarkMode}
                />
            )}
            
            {selectedTab === "technical" && (
                <TechnicalTabContent 
                    indicators={indicators}
                    colorScheme={colorScheme}
                    isDarkMode={isDarkMode}
                />
            )}
            
            {selectedTab === "fundamental" && (
                <FundamentalTabContent 
                    colorScheme={colorScheme}
                    isDarkMode={isDarkMode}
                />
            )}
            
            {selectedTab === "news" && (
                <NewsTabContent 
                    newsData={newsData}
                    symbol={symbol}
                    colorScheme={colorScheme}
                    isDarkMode={isDarkMode}
                    transitions={transitions}
                />
            )}
        </div>
    );
};

export default TabContent; 