"use client"

import React from 'react';

interface ChartControlsProps {
    chartType: string;
    setChartType: (type: any) => void;
    period: string;
    setPeriod: (period: string) => void;
    interval: string;
    setInterval: (interval: string) => void;
    showIndicators: boolean;
    setShowIndicators: (show: boolean) => void;
    compareSymbol: string;
    setCompareSymbol: (symbol: string) => void;
    addCompareSymbol: () => void;
    colorScheme: any;
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
    indicators: string[];
    periods: string[];
    intervals: string[];
    drawingTools: string[];
}

const ChartControls: React.FC<ChartControlsProps> = ({
    chartType,
    setChartType,
    period,
    setPeriod,
    interval,
    setInterval,
    showIndicators,
    setShowIndicators,
    compareSymbol,
    setCompareSymbol,
    addCompareSymbol,
    colorScheme,
    selectedTab,
    setSelectedTab,
    indicators,
    periods,
    intervals,
    drawingTools
}) => {
    return (
        <div style={{ 
            backgroundColor: colorScheme.cardBg, 
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
            {/* Tabs */}
            <div style={{ 
                display: "flex",
                borderBottom: `1px solid ${colorScheme.border}`,
                marginBottom: "15px"
            }}>
                {["chart", "technical", "fundamental", "news"].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        style={{
                            background: "transparent",
                            border: "none",
                            borderBottom: selectedTab === tab ? `2px solid ${colorScheme.highlight}` : "none",
                            padding: "10px 20px",
                            color: selectedTab === tab ? colorScheme.highlight : colorScheme.text,
                            cursor: "pointer",
                            fontWeight: selectedTab === tab ? "600" : "normal",
                            fontSize: "0.9rem",
                            marginBottom: "-1px"
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Chart controls */}
            <div style={{ 
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "15px"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select 
                        value={chartType} 
                        onChange={(e) => setChartType(e.target.value)}
                        style={{ 
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${colorScheme.border}`,
                            backgroundColor: colorScheme.cardBg,
                            color: colorScheme.text
                        }}
                    >
                        <option value="line">Line</option>
                        <option value="area">Area</option>
                        <option value="bar">Volume</option>
                        <option value="candlestick">Candlestick</option>
                        <option value="heikinashi">Heikin-Ashi</option>
                        <option value="renko">Renko</option>
                    </select>

                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ 
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${colorScheme.border}`,
                            backgroundColor: colorScheme.cardBg,
                            color: colorScheme.text
                        }}
                    >
                        {periods.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    <select 
                        value={interval} 
                        onChange={(e) => setInterval(e.target.value)}
                        style={{ 
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${colorScheme.border}`,
                            backgroundColor: colorScheme.cardBg,
                            color: colorScheme.text
                        }}
                    >
                        {intervals.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}>
                        <input 
                            type="checkbox" 
                            id="showIndicators" 
                            checked={showIndicators}
                            onChange={() => setShowIndicators(!showIndicators)}
                        />
                        <label htmlFor="showIndicators" style={{ fontSize: "0.9rem" }}>Show Indicators</label>
                    </div>

                    <input 
                        type="text" 
                        value={compareSymbol} 
                        onChange={(e) => setCompareSymbol(e.target.value.toUpperCase())} 
                        placeholder="Compare with..." 
                        style={{ 
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${colorScheme.border}`,
                            backgroundColor: colorScheme.cardBg,
                            color: colorScheme.text,
                            width: "150px"
                        }} 
                    />
                </div>
            </div>

            {/* Indicators Selection (conditionally shown) */}
            {showIndicators && (
                <div style={{ 
                    display: "flex", 
                    gap: "10px", 
                    marginTop: "15px",
                    flexWrap: "wrap" 
                }}>
                    {indicators.map((indicator) => (
                        <button 
                            key={indicator}
                            style={{
                                background: "transparent",
                                border: `1px solid ${colorScheme.border}`,
                                borderRadius: "4px",
                                padding: "5px 10px",
                                color: colorScheme.text,
                                cursor: "pointer",
                                fontSize: "0.8rem"
                            }}
                        >
                            {indicator}
                        </button>
                    ))}
                </div>
            )}

            {/* Pro Trading Tools */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
                borderTop: `1px solid ${colorScheme.border}`,
                paddingTop: "10px"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        style={{
                            background: colorScheme.buttonBg,
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: colorScheme.buttonText,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <span>📈</span> Trade
                    </button>
                    <button
                        style={{
                            background: "transparent",
                            border: `1px solid ${colorScheme.border}`,
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: colorScheme.text,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <span>🔔</span> Set Alert
                    </button>
                    <button
                        style={{
                            background: "transparent",
                            border: `1px solid ${colorScheme.border}`,
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: colorScheme.text,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <span>📊</span> Advanced View
                    </button>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        style={{
                            background: "transparent",
                            border: `1px solid ${colorScheme.border}`,
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: colorScheme.text,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <span>💾</span> Save View
                    </button>
                    <button
                        style={{
                            background: "transparent",
                            border: `1px solid ${colorScheme.border}`,
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: colorScheme.text,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <span>📤</span> Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChartControls; 