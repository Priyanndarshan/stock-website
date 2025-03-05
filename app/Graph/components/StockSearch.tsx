"use client"

import React from 'react';

interface StockSearchProps {
    symbol: string;
    setSymbol: (symbol: string) => void;
    fetchStockData: () => void;
    addToWatchlist: () => void;
    stockInfo: any;
    colorScheme: any;
}

const StockSearch: React.FC<StockSearchProps> = ({ 
    symbol, 
    setSymbol, 
    fetchStockData, 
    addToWatchlist,
    stockInfo, 
    colorScheme 
}) => {
    return (
        <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "20px"
        }}>
            {/* Search bar */}
            <div style={{ 
                display: "flex", 
                gap: "10px",
                alignItems: "center"
            }}>
                <input 
                    type="text" 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                    placeholder="Enter Stock Symbol" 
                    style={{ 
                        flex: 1,
                        padding: "12px 15px",
                        borderRadius: "6px",
                        border: `1px solid ${colorScheme.border}`,
                        backgroundColor: colorScheme.cardBg,
                        color: colorScheme.text,
                        fontSize: "1rem"
                    }} 
                />
                <button 
                    onClick={fetchStockData}
                    style={{
                        background: colorScheme.buttonBg,
                        border: "none",
                        borderRadius: "6px",
                        padding: "12px 15px",
                        color: colorScheme.buttonText,
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Search
                </button>
                <button 
                    onClick={addToWatchlist}
                    style={{
                        background: "transparent",
                        border: `1px solid ${colorScheme.border}`,
                        borderRadius: "6px",
                        padding: "12px 15px",
                        color: colorScheme.text,
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Add to Watchlist
                </button>
            </div>

            {/* Stock info cards */}
            {stockInfo && (
                <div style={{ 
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap"
                }}>
                    <div style={{ 
                        backgroundColor: colorScheme.cardBg,
                        borderRadius: "8px",
                        padding: "15px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        flex: "1",
                        minWidth: "250px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h2 style={{ margin: "0", fontSize: "1.6rem" }}>{symbol}</h2>
                                <div style={{ 
                                    fontSize: "2.2rem", 
                                    fontWeight: "bold", 
                                    margin: "15px 0 10px" 
                                }}>
                                    ₹{stockInfo.lastPrice}
                                </div>
                                <div style={{ 
                                    color: Number(stockInfo.change) >= 0 ? colorScheme.positive : colorScheme.negative,
                                    fontSize: "1.1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px"
                                }}>
                                    <span>{Number(stockInfo.change) >= 0 ? "+" : ""}{stockInfo.change} ({stockInfo.percentChange}%)</span>
                                    <span>{Number(stockInfo.change) >= 0 ? "▲" : "▼"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "15px",
                        flex: "2"
                    }}>
                        <div style={{ 
                            backgroundColor: colorScheme.cardBg,
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                        }}>
                            <div style={{ color: colorScheme.text === "#E0E0E0" ? "#aaa" : "#666", fontSize: "0.8rem" }}>High</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>₹{stockInfo.high}</div>
                        </div>
                        <div style={{ 
                            backgroundColor: colorScheme.cardBg,
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                        }}>
                            <div style={{ color: colorScheme.text === "#E0E0E0" ? "#aaa" : "#666", fontSize: "0.8rem" }}>Low</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>₹{stockInfo.low}</div>
                        </div>
                        {stockInfo.volume && (
                            <div style={{ 
                                backgroundColor: colorScheme.cardBg,
                                borderRadius: "8px",
                                padding: "15px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                            }}>
                                <div style={{ color: colorScheme.text === "#E0E0E0" ? "#aaa" : "#666", fontSize: "0.8rem" }}>Volume</div>
                                <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>{stockInfo.volume.toLocaleString()}</div>
                            </div>
                        )}
                        {stockInfo.pe && (
                            <div style={{ 
                                backgroundColor: colorScheme.cardBg,
                                borderRadius: "8px",
                                padding: "15px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                            }}>
                                <div style={{ color: colorScheme.text === "#E0E0E0" ? "#aaa" : "#666", fontSize: "0.8rem" }}>P/E Ratio</div>
                                <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>{stockInfo.pe}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockSearch; 