"use client"

import React from 'react';

interface FundamentalTabContentProps {
    colorScheme: any;
    isDarkMode: boolean;
}

const FundamentalTabContent: React.FC<FundamentalTabContentProps> = ({
    colorScheme,
    isDarkMode
}) => {
    return (
        <div>
            <h4 style={{ margin: "0 0 15px", fontSize: "1rem" }}>Financial Information</h4>
            
            <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "30px"
            }}>
                <div style={{ 
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    padding: "15px"
                }}>
                    <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Market Cap</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "5px" }}>
                        ₹{(Math.random() * 1000000000000).toLocaleString()}
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    padding: "15px"
                }}>
                    <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>P/E Ratio</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "5px" }}>
                        {(Math.random() * 40 + 5).toFixed(2)}
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    padding: "15px"
                }}>
                    <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>EPS</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "5px" }}>
                        ₹{(Math.random() * 100 + 10).toFixed(2)}
                    </div>
                </div>
                
                <div style={{ 
                    backgroundColor: colorScheme.background,
                    borderRadius: "8px",
                    padding: "15px"
                }}>
                    <div style={{ fontSize: "0.8rem", color: isDarkMode ? "#aaa" : "#666" }}>Dividend Yield</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "5px" }}>
                        {(Math.random() * 5).toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <h4 style={{ margin: "20px 0 15px", fontSize: "1rem" }}>Quarterly Results</h4>
            <div style={{ 
                backgroundColor: colorScheme.background,
                borderRadius: "8px",
                padding: "15px",
                overflowX: "auto"
            }}>
                <table style={{ 
                    width: "100%", 
                    borderCollapse: "collapse",
                    fontSize: "0.9rem"
                }}>
                    <thead>
                        <tr>
                            <th style={{ 
                                textAlign: "left", 
                                padding: "8px 15px", 
                                borderBottom: `1px solid ${colorScheme.border}`
                            }}>Quarter</th>
                            <th style={{ 
                                textAlign: "right", 
                                padding: "8px 15px", 
                                borderBottom: `1px solid ${colorScheme.border}`
                            }}>Revenue</th>
                            <th style={{ 
                                textAlign: "right", 
                                padding: "8px 15px", 
                                borderBottom: `1px solid ${colorScheme.border}`
                            }}>Net Profit</th>
                            <th style={{ 
                                textAlign: "right", 
                                padding: "8px 15px", 
                                borderBottom: `1px solid ${colorScheme.border}`
                            }}>EPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['Q1 2023', 'Q4 2022', 'Q3 2022', 'Q2 2022'].map((quarter) => (
                            <tr key={quarter}>
                                <td style={{ 
                                    padding: "8px 15px", 
                                    borderBottom: `1px solid ${colorScheme.border}`
                                }}>{quarter}</td>
                                <td style={{ 
                                    textAlign: "right", 
                                    padding: "8px 15px", 
                                    borderBottom: `1px solid ${colorScheme.border}`
                                }}>₹{(Math.random() * 100000000000).toLocaleString()}</td>
                                <td style={{ 
                                    textAlign: "right", 
                                    padding: "8px 15px", 
                                    borderBottom: `1px solid ${colorScheme.border}`
                                }}>₹{(Math.random() * 10000000000).toLocaleString()}</td>
                                <td style={{ 
                                    textAlign: "right", 
                                    padding: "8px 15px", 
                                    borderBottom: `1px solid ${colorScheme.border}`
                                }}>₹{(Math.random() * 100).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundamentalTabContent; 