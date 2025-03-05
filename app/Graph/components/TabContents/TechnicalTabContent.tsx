"use client"

import React from 'react';

interface TechnicalTabContentProps {
    indicators: string[];
    colorScheme: any;
    isDarkMode: boolean;
}

const TechnicalTabContent: React.FC<TechnicalTabContentProps> = ({
    indicators,
    colorScheme,
    isDarkMode
}) => {
    return (
        <div>
            <h4 style={{ margin: "0 0 15px", fontSize: "1rem" }}>Technical Indicators</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {indicators.map((ind) => (
                    <div 
                        key={ind}
                        style={{
                            backgroundColor: colorScheme.background,
                            borderRadius: "8px",
                            padding: "15px",
                            width: "calc(33.333% - 8px)",
                            minWidth: "200px",
                            boxSizing: "border-box"
                        }}
                    >
                        <div style={{ fontWeight: "600", marginBottom: "8px" }}>{ind}</div>
                        <div style={{ 
                            color: Math.random() > 0.5 ? colorScheme.positive : colorScheme.negative,
                            fontWeight: "600",
                            fontSize: "1.2rem"
                        }}>
                            {(Math.random() * 100).toFixed(2)}
                        </div>
                        <div style={{ 
                            fontSize: "0.8rem", 
                            color: isDarkMode ? "#aaa" : "#666",
                            marginTop: "5px"
                        }}>
                            {Math.random() > 0.5 ? "Bullish" : "Bearish"} signal
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechnicalTabContent; 