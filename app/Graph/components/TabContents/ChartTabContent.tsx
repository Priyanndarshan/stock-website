"use client"

import React from 'react';

interface ChartTabContentProps {
    drawingTools: string[];
    compareSymbols: string[];
    removeCompareSymbol: (symbol: string) => void;
    stockInfo: any;
    colorScheme: any;
    isDarkMode: boolean;
}

const ChartTabContent: React.FC<ChartTabContentProps> = ({
    drawingTools,
    compareSymbols,
    removeCompareSymbol,
    stockInfo,
    colorScheme,
    isDarkMode
}) => {
    return (
        <div>
            {/* Drawing Tools */}
            <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Drawing Tools</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {drawingTools.map((tool) => (
                        <button 
                            key={tool}
                            style={{
                                background: "transparent",
                                border: `1px solid ${colorScheme.border}`,
                                borderRadius: "4px",
                                padding: "6px 12px",
                                color: colorScheme.text,
                                cursor: "pointer",
                                fontSize: "0.8rem"
                            }}
                        >
                            {tool}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Comparison Symbols */}
            {compareSymbols.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Comparing With</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {compareSymbols.map((sym) => (
                            <div 
                                key={sym}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: colorScheme.background,
                                    borderRadius: "4px",
                                    padding: "5px 10px",
                                    fontSize: "0.8rem"
                                }}
                            >
                                <span>{sym}</span>
                                <button
                                    onClick={() => removeCompareSymbol(sym)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: colorScheme.text,
                                        cursor: "pointer",
                                        padding: "0",
                                        fontSize: "0.8rem"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trading Summary */}
            <div style={{ marginTop: "20px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Trading Summary</h4>
                <div style={{ 
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    padding: "15px"
                }}>
                    <div style={{ 
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "15px"
                    }}>
                        <div>
                            <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Support Levels</div>
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                gap: "5px",
                                marginTop: "5px"
                            }}>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600",
                                    color: colorScheme.negative 
                                }}>₹{(parseFloat(stockInfo?.lastPrice || "0") * 0.95).toFixed(2)}</div>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600",
                                    color: colorScheme.negative 
                                }}>₹{(parseFloat(stockInfo?.lastPrice || "0") * 0.90).toFixed(2)}</div>
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Resistance Levels</div>
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                gap: "5px",
                                marginTop: "5px"
                            }}>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600",
                                    color: colorScheme.positive 
                                }}>₹{(parseFloat(stockInfo?.lastPrice || "0") * 1.05).toFixed(2)}</div>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600",
                                    color: colorScheme.positive 
                                }}>₹{(parseFloat(stockInfo?.lastPrice || "0") * 1.10).toFixed(2)}</div>
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Trading Strategy</div>
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                gap: "5px",
                                marginTop: "5px"
                            }}>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600",
                                    color: Number(stockInfo?.change) >= 0 ? colorScheme.positive : colorScheme.negative
                                }}>{Number(stockInfo?.change) >= 0 ? "BUY" : "HOLD"}</div>
                                <div style={{ fontSize: "0.8rem" }}>Target: ₹{(parseFloat(stockInfo?.lastPrice || "0") * 1.10).toFixed(2)}</div>
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Risk Assessment</div>
                            <div style={{ 
                                display: "flex", 
                                flexDirection: "column",
                                gap: "5px",
                                marginTop: "5px"
                            }}>
                                <div style={{ 
                                    fontSize: "0.9rem", 
                                    fontWeight: "600"
                                }}>Medium</div>
                                <div style={{ fontSize: "0.8rem" }}>Stop Loss: ₹{(parseFloat(stockInfo?.lastPrice || "0") * 0.95).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartTabContent; 