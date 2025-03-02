"use client"

import React from 'react';

interface NewsTabContentProps {
    newsData: any[];
    symbol: string;
    colorScheme: any;
    isDarkMode: boolean;
    transitions: any;
}

const NewsTabContent: React.FC<NewsTabContentProps> = ({
    newsData,
    symbol,
    colorScheme,
    isDarkMode,
    transitions
}) => {
    return (
        <div style={{
            ...transitions.fadeIn,
            animation: "fadeIn 0.5s"
        }}>
            <h4 style={{ 
                margin: "0 0 15px", 
                fontSize: "1.4rem", 
                transition: "font-size 0.3s ease" 
            }}>Latest News for {symbol}</h4>
            {newsData.length > 0 ? (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "15px",
                }}>
                    {newsData.map((news, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                backgroundColor: colorScheme.background,
                                padding: "20px",
                                borderRadius: "8px",
                                border: `1px solid ${colorScheme.border}`,
                                transform: `translateY(${20 * index}px)`,
                                opacity: 0,
                                animation: `slideUpFadeIn 0.5s forwards ${0.1 * index}s`
                            }}
                        >
                            <h3 style={{ 
                                margin: "0 0 10px", 
                                fontSize: "1.2rem", 
                                fontWeight: "600",
                                color: colorScheme.highlight 
                            }}>{news[0]}</h3>
                            <p style={{ 
                                margin: "0 0 15px", 
                                fontSize: "1rem",
                                lineHeight: "1.7" 
                            }}>{news[1]}</p>
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                fontSize: "0.8rem",
                                color: isDarkMode ? "#aaa" : "#666"
                            }}>
                                <span>Source: Financial News</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ 
                    padding: "20px", 
                    textAlign: "center",
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    animation: "fadeIn 0.5s"
                }}>
                    No news available for {symbol}
                </div>
            )}
        </div>
    );
};

export default NewsTabContent; 