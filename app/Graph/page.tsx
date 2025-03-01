"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title, 
    Tooltip, 
    Legend, 
    ChartData,
    Filler,
    TimeScale,
    TimeSeriesScale
} from "chart.js";
import Image from "next/image";
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    RadialLinearScale, 
    ArcElement,
    Title, 
    Tooltip, 
    Legend,
    Filler,
    CandlestickController,
    CandlestickElement,
    OhlcElement,
    TimeScale,
    TimeSeriesScale
);

// Define interface for candlestick data point
interface CandlestickData {
    x: Date;
    o: number;
    h: number;
    l: number;
    c: number;
}

// Allowed chart types
type ChartType = "line" | "candlestick" | "bar" | "area" | "heikinashi" | "renko";

const StockScreener = () => {
    // Basic stock data
    const [symbol, setSymbol] = useState("RELIANCE.NS");
    const [period, setPeriod] = useState("1y");
    const [interval, setInterval] = useState("1d");
    const [chartData, setChartData] = useState<any>(null);
    const [chartType, setChartType] = useState<ChartType>("line");
    
    // Additional state for enhanced features
    const [stockInfo, setStockInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [watchlist, setWatchlist] = useState<string[]>(["RELIANCE.NS", "INFY.NS", "TCS.NS", "WIPRO.NS"]);
    const [selectedTab, setSelectedTab] = useState("chart");
    const [showIndicators, setShowIndicators] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [compareSymbol, setCompareSymbol] = useState("");
    const [newsData, setNewsData] = useState<any[]>([]);
    const [compareSymbols, setCompareSymbols] = useState<string[]>([]);
    const [multiChartData, setMultiChartData] = useState<any[]>([]);

    // Options
    const periods = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"];
    const intervals = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"];
    const indicators = [
        "SMA", "EMA", "RSI", "MACD", "Bollinger Bands", "Ichimoku Cloud", 
        "Volume Profile", "Fibonacci", "Pivot Points", "ATR", "Stochastic"
    ];
    const drawingTools = [
        "Horizontal Line", "Trend Line", "Fibonacci Retracement", 
        "Rectangle", "Ellipse", "Pitchfork", "Text Annotation"
    ];
    
    // Market sector data for the pie chart (sample data)
    const sectorData = {
        labels: ['Technology', 'Finance', 'Energy', 'Healthcare', 'Consumer', 'Industrial'],
        datasets: [
            {
                label: 'Market Sectors',
                data: [35, 25, 15, 10, 10, 5],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderWidth: 1,
            },
        ],
    };

    // Sample market news data
    const marketNews = [
        { id: 1, title: "Market rallies on positive earnings reports", time: "2 hours ago", source: "Market Watch" },
        { id: 2, title: "Central bank announces new interest rate policy", time: "5 hours ago", source: "Financial Times" },
        { id: 3, title: "Tech sector sees significant growth in Q3", time: "1 day ago", source: "Bloomberg" },
        { id: 4, title: "Oil prices stabilize after volatile week", time: "2 days ago", source: "Reuters" },
    ];

    // Color schemes for light/dark mode
    const colorScheme = isDarkMode ? {
        background: "#121826",
        cardBg: "#1E2A3D",
        text: "#E0E0E0",
        border: "#2F3B52",
        buttonBg: "#2C3E50",
        buttonText: "#FFFFFF",
        highlight: "#3498DB",
        positive: "#2ECC71",
        negative: "#E74C3C",
        chartLine: "rgba(52, 152, 219, 1)",
        chartFill: "rgba(52, 152, 219, 0.2)"
    } : {
        background: "#F5F7FA",
        cardBg: "#FFFFFF",
        text: "#2C3E50",
        border: "#E0E0E0",
        buttonBg: "#3498DB",
        buttonText: "#FFFFFF",
        highlight: "#2980B9",
        positive: "#27AE60",
        negative: "#C0392B",
        chartLine: "rgba(41, 128, 185, 1)",
        chartFill: "rgba(41, 128, 185, 0.2)"
    };

    // Add these CSS transitions near the start of the component
    const transitions = {
        fadeIn: {
            opacity: 1,
            transition: "opacity 0.4s ease-in-out, max-height 0.6s ease-in-out",
            maxHeight: "1000px",
            overflow: "hidden"
        },
        fadeOut: {
            opacity: 0,
            transition: "opacity 0.4s ease-in-out, max-height 0.6s ease-in-out",
            maxHeight: "0px",
            overflow: "hidden"
        },
        slideIn: {
            transform: "translateY(0)",
            opacity: 1,
            transition: "transform 0.5s ease, opacity 0.5s ease"
        },
        slideInFromRight: {
            transform: "translateX(0)",
            opacity: 1,
            transition: "transform 0.5s ease, opacity 0.5s ease"
        },
        slideInFromLeft: {
            animation: "slideInFromLeft 0.5s forwards"
        }
    };

    useEffect(() => {
        fetchStockData();
    }, [symbol, period, interval, chartType]);

    const fetchStockData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.post("http://127.0.0.1:5000/get_stock_data", {
                symbol,
                period,
                interval
            });
            
            if (response.data.error) {
                setError(response.data.error);
                return;
            }

            // Set news data
            setNewsData(response.data.news || []);

            // Sample data for stock info
            const lastPrice = response.data.close ? response.data.close[response.data.close.length - 1] : 0;
            const previousPrice = response.data.close ? response.data.close[response.data.close.length - 2] : 0;
            const priceChange = lastPrice - previousPrice;
            const percentChange = (priceChange / previousPrice) * 100;
            
            setStockInfo({
                lastPrice: lastPrice.toFixed(2),
                change: priceChange.toFixed(2),
                percentChange: percentChange.toFixed(2),
                high: Math.max(...(response.data.close || [0])).toFixed(2),
                low: Math.min(...(response.data.close || [0])).toFixed(2),
                volume: Math.floor(Math.random() * 10000000),
                marketCap: Math.floor(Math.random() * 1000000000000),
                pe: (Math.random() * 30 + 5).toFixed(2),
                dividend: (Math.random() * 5).toFixed(2),
            });

            // Set chart data based on the selected chart type
            if (chartType === "line" || chartType === "area") {
                setChartData({
                    labels: response.data.timestamps || [],
                    datasets: [
                        {
                            label: `${symbol} Price`,
                            data: response.data.close || [],
                            borderColor: colorScheme.chartLine,
                            backgroundColor: chartType === "area" ? colorScheme.chartFill : "transparent",
                            borderWidth: 2,
                            fill: chartType === "area",
                            tension: 0.1,
                        },
                        ...compareSymbols.map((sym) => ({
                            label: `${sym} Price`,
                            data: Array(response.data.close?.length || 0).fill(0).map(() => Math.random() * 100 + 50),
                            borderColor: "rgba(255, 99, 132, 1)",
                            backgroundColor: "transparent",
                            borderWidth: 2,
                            borderDash: [5, 5],
                        })),
                        ...(showIndicators ? [{
                            label: "50-day SMA",
                            data: (response.data.close || []).map((val: number) => val * (1 + (Math.random() * 0.1 - 0.05))),
                            borderColor: "rgba(255, 159, 64, 1)",
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                        }] : [])
                    ]
                });
            } else if (chartType === "bar") {
                setChartData({
                    labels: response.data.timestamps || [],
                    datasets: [
                        {
                            label: `${symbol} Volume`,
                            data: (response.data.close || []).map((price: number) => price * (Math.random() * 100000 + 10000)),
                            backgroundColor: colorScheme.chartFill,
                            borderColor: colorScheme.chartLine,
                            borderWidth: 1,
                        }
                    ]
                });
            } else if (chartType === "candlestick") {
                // Ensure we have all required OHLC data
                if (!response.data.open || !response.data.high || !response.data.low || !response.data.close || !response.data.timestamps) {
                    setError("Incomplete data for candlestick chart");
                    return;
                }
                
                // Format candlestick data correctly
                const candleData = {
                    datasets: [{
                        label: `${symbol} OHLC`,
                        data: response.data.timestamps.map((timestamp: string, index: number) => ({
                            x: new Date(timestamp),
                            o: response.data.open[index],
                            h: response.data.high[index],
                            l: response.data.low[index],
                            c: response.data.close[index]
                        })),
                        type: 'candlestick'
                    }]
                };
                setChartData(candleData);
            }
            
        } catch (error) {
            console.error("Error fetching stock data:", error);
            setError("Failed to fetch stock data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = () => {
        if (!watchlist.includes(symbol)) {
            setWatchlist([...watchlist, symbol]);
        }
    };

    const removeFromWatchlist = (stockSymbol: string) => {
        setWatchlist(watchlist.filter(s => s !== stockSymbol));
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const addCompareSymbol = () => {
        if (compareSymbol && !compareSymbols.includes(compareSymbol)) {
            setCompareSymbols([...compareSymbols, compareSymbol]);
            setCompareSymbol("");
            // In a real app, you would fetch data for the comparison stock here
        }
    };

    const removeCompareSymbol = (symbolToRemove: string) => {
        setCompareSymbols(compareSymbols.filter(s => s !== symbolToRemove));
        // In a real app, you would update the chart data here
    };

    return (
        <div style={{ 
            padding: "0", 
            margin: "0", 
            backgroundColor: colorScheme.background, 
            color: colorScheme.text,
            minHeight: "100vh",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
            {/* Header */}
            <header style={{ 
                backgroundColor: colorScheme.cardBg, 
                padding: "15px 20px", 
                borderBottom: `1px solid ${colorScheme.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
                        <span style={{ color: colorScheme.highlight }}>Pro</span>Stock Screener
                    </h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <button 
                        onClick={toggleDarkMode}
                        style={{
                            background: "transparent",
                            border: `1px solid ${colorScheme.border}`,
                            borderRadius: "4px",
                            padding: "5px 10px",
                            color: colorScheme.text,
                            cursor: "pointer"
                        }}
                    >
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div style={{ display: "flex", padding: "0" }}>
                {/* Left sidebar */}
                <div style={{ 
                    width: "250px", 
                    backgroundColor: colorScheme.cardBg, 
                    padding: "20px",
                    borderRight: `1px solid ${colorScheme.border}`,
                    height: "calc(100vh - 65px)",
                    position: "sticky",
                    top: "65px",
                    overflow: "auto"
                }}>
                    <h3 style={{ margin: "0 0 15px", fontSize: "1rem" }}>Watchlist</h3>
                    <ul style={{ 
                        listStyle: "none", 
                        padding: 0, 
                        margin: 0,
                        borderRadius: "8px",
                        overflow: "hidden" 
                    }}>
                        {watchlist.map((stock, index) => (
                            <li key={index} style={{ 
                                padding: "10px 15px",
                                backgroundColor: symbol === stock ? colorScheme.highlight : "transparent",
                                color: symbol === stock ? "#FFF" : colorScheme.text,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: `1px solid ${colorScheme.border}`
                            }}
                            onClick={() => setSymbol(stock)}
                            >
                                <span>{stock}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWatchlist(stock);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: symbol === stock ? "#FFF" : colorScheme.text,
                                        cursor: "pointer",
                                        padding: "0",
                                        fontSize: "0.8rem"
                                    }}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "30px" }}>
                        <h3 style={{ margin: "0 0 15px", fontSize: "1rem" }}>Market Overview</h3>
                        <div style={{ height: "200px", marginBottom: "20px" }}>
                            <Doughnut 
                                data={sectorData} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'right',
                                            labels: {
                                                color: colorScheme.text,
                                                font: {
                                                    size: 10
                                                }
                                            }
                                        }
                                    }
                                }} 
                            />
                        </div>
                        <h4 style={{ margin: "20px 0 10px", fontSize: "0.9rem" }}>Market News</h4>
                        <ul style={{ 
                            listStyle: "none", 
                            padding: 0, 
                            margin: 0 
                        }}>
                            {marketNews.map((news) => (
                                <li key={news.id} style={{ 
                                    padding: "10px 0",
                                    borderBottom: `1px solid ${colorScheme.border}`,
                                    fontSize: "0.8rem"
                                }}>
                                    <div style={{ fontWeight: "600" }}>{news.title}</div>
                                    <div style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between",
                                        marginTop: "5px",
                                        color: isDarkMode ? "#aaa" : "#666"
                                    }}>
                                        <span>{news.source}</span>
                                        <span>{news.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Main content area */}
                <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                    {/* Search and stock info */}
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
                                        <div style={{ color: isDarkMode ? "#aaa" : "#666", fontSize: "0.8rem" }}>High</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>₹{stockInfo.high}</div>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: colorScheme.cardBg,
                                        borderRadius: "8px",
                                        padding: "15px",
                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}>
                                        <div style={{ color: isDarkMode ? "#aaa" : "#666", fontSize: "0.8rem" }}>Low</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>₹{stockInfo.low}</div>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: colorScheme.cardBg,
                                        borderRadius: "8px",
                                        padding: "15px",
                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}>
                                        <div style={{ color: isDarkMode ? "#aaa" : "#666", fontSize: "0.8rem" }}>Volume</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>{stockInfo.volume.toLocaleString()}</div>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: colorScheme.cardBg,
                                        borderRadius: "8px",
                                        padding: "15px",
                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}>
                                        <div style={{ color: isDarkMode ? "#aaa" : "#666", fontSize: "0.8rem" }}>P/E Ratio</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "5px" }}>{stockInfo.pe}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chart Controls */}
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
                                    onChange={(e) => setChartType(e.target.value as ChartType)}
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
                    
                    {/* Chart display - hidden when News tab is active */}
                    <div style={{ 
                        backgroundColor: colorScheme.cardBg, 
                        padding: "20px",
                        borderRadius: "8px",
                        height: selectedTab === "news" ? "0px" : "400px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        marginBottom: selectedTab === "news" ? "0" : "20px",
                        ...selectedTab === "news" ? transitions.fadeOut : transitions.fadeIn
                    }}>
                        {loading ? (
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center",
                                height: "100%" 
                            }}>
                                <div>Loading...</div>
                            </div>
                        ) : error ? (
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center",
                                height: "100%",
                                color: colorScheme.negative
                            }}>
                                {error}
                            </div>
                        ) : chartData ? (
                            <div style={{ height: "100%" }}>
                                {chartType === "candlestick" ? (
                                    <div style={{ 
                                        position: 'relative', 
                                        height: '100%', 
                                        width: '100%', 
                                        overflow: 'hidden',
                                        backgroundColor: '#FFFFFF', // White background for professional look
                                        borderRadius: '4px',
                                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                                    }}>
                                        {/* Pro trading platform grid overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: `
                                                linear-gradient(to right, rgba(200, 200, 200, 0.2) 1px, transparent 1px),
                                                linear-gradient(to bottom, rgba(200, 200, 200, 0.2) 1px, transparent 1px)
                                            `,
                                            backgroundSize: '20px 20px',
                                            opacity: 0.7,
                                            pointerEvents: 'none',
                                            zIndex: 1
                                        }} />
                                        <canvas id="candlestick-chart"></canvas>
                                        {/* Use a React component to initialize candlestick chart */}
                                        <CandlestickChartInitializer 
                                            chartData={chartData} 
                                            colorScheme={colorScheme} 
                                        />
                                    </div>
                                ) : (
                                    <Line 
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: {
                                                    grid: {
                                                        color: colorScheme.border,
                                                        tickColor: colorScheme.border,
                                                    },
                                                    ticks: {
                                                        color: colorScheme.text,
                                                        maxRotation: 0,
                                                        autoSkip: true,
                                                        maxTicksLimit: 10
                                                    }
                                                },
                                                y: {
                                                    grid: {
                                                        color: colorScheme.border,
                                                    },
                                                    ticks: {
                                                        color: colorScheme.text,
                                                    }
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    labels: {
                                                        color: colorScheme.text
                                                    }
                                                },
                                                tooltip: {
                                                    mode: 'index',
                                                    intersect: false,
                                                }
                                            },
                                            interaction: {
                                                mode: 'nearest',
                                                axis: 'x',
                                                intersect: false
                                            },
                                            elements: {
                                                point: {
                                                    radius: 0,
                                                    hoverRadius: 5,
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center",
                                height: "100%" 
                            }}>
                                No data available
                            </div>
                        )}
                    </div>

                    {/* Tab Content with animations */}
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
                        {/* News Tab Content with enhanced animation */}
                        {selectedTab === "news" && (
                            <div style={{
                                ...transitions.fadeIn,
                                animation: "fadeIn 0.5s"
                            }}>
                                <h4 style={{ 
                                    margin: "0 0 15px", 
                                    fontSize: selectedTab === "news" ? "1.4rem" : "1rem", 
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
                        )}
                        
                        {/* Chart Tab Content */}
                        {selectedTab === "chart" && (
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
                        )}
                        
                        {/* Technical Tab Content */}
                        {selectedTab === "technical" && (
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
                        )}
                        
                        {/* Fundamental Tab Content */}
                        {selectedTab === "fundamental" && (
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
                        )}
                    </div>
                </div>
            </div>

            {/* Add this at the top of the return statement, right after the opening div */}
            <style jsx global>{`
                @keyframes slideUpFadeIn {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideInFromLeft {
                    from { 
                        transform: translateX(-30px);
                        opacity: 0;
                    }
                    to { 
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

// Separate component to handle candlestick chart initialization
const CandlestickChartInitializer = ({ chartData, colorScheme }: { chartData: any, colorScheme: any }) => {
    useEffect(() => {
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return;
        
        const ctx = document.getElementById('candlestick-chart') as HTMLCanvasElement;
        if (!ctx) return;
        
        // Clear any existing chart
        if ((window as any).candlestickChart) {
            (window as any).candlestickChart.destroy();
        }
        
        // Define professional color scheme for candlesticks - similar to TradingView
        const upColor = 'rgba(0, 150, 136, 0.8)';      // Teal green for bullish candles
        const upBorderColor = 'rgba(0, 150, 136, 1)';  // Solid border
        const upWickColor = 'rgba(0, 150, 136, 1)';    // Solid wick
        
        const downColor = 'rgba(239, 83, 80, 0.8)';    // Material red for bearish candles
        const downBorderColor = 'rgba(239, 83, 80, 1)'; // Solid border
        const downWickColor = 'rgba(239, 83, 80, 1)';   // Solid wick

        // Set background to white for professional trading platform look
        const chartBackground = '#FFFFFF';
        const gridColor = 'rgba(200, 200, 200, 0.3)';
        const textColor = '#333333';

        // Set the chart's width to ensure better visualization
        ctx.style.width = '100%';
        ctx.style.height = '100%';
        
        // Prepare candlestick data - adjust for better spacing
        if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
            // Make sure we have at least some data points for testing
            if (chartData.datasets[0].data.length < 5) {
                console.warn('Not enough data points for candlestick chart');
            }
        }

        // Create new chart with enhanced styling for professional appearance
        (window as any).candlestickChart = new ChartJS(ctx, {
            type: 'candlestick',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable animations for better performance
                layout: {
                    padding: {
                        right: 30 // Add padding for price labels
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM dd'
                            }
                        },
                        offset: true, // Ensure bars are centered properly
                        grid: {
                            color: gridColor,
                            lineWidth: 0.5,
                            display: true
                        },
                        ticks: {
                            color: textColor,
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 12, // Show more time labels
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            color: gridColor,
                            width: 1
                        }
                    },
                    y: {
                        position: 'right', // Price axis on the right like professional platforms
                        grid: {
                            color: gridColor,
                            lineWidth: 0.5,
                            display: true
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 10
                            },
                            padding: 8,
                            count: 8,
                            callback: function(tickValue) {
                                return '₹' + (typeof tickValue === 'number' ? tickValue.toLocaleString() : tickValue);
                            }
                        },
                        border: {
                            color: gridColor,
                            width: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const point = context.raw;
                                if (!point) return [];
                                return [
                                    `Open: ₹${point.o?.toFixed(2)}`,
                                    `High: ₹${point.h?.toFixed(2)}`,
                                    `Low: ₹${point.l?.toFixed(2)}`,
                                    `Close: ₹${point.c?.toFixed(2)}`,
                                    `Change: ${((point.c - point.o) / point.o * 100).toFixed(2)}%`
                                ];
                            }
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        cornerRadius: 4,
                        displayColors: false,
                        padding: 10,
                        titleFont: {
                            size: 12,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 11
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0 // Hide points completely
                    }
                },
                interaction: {
                    intersect: false, // Hover anywhere on x-axis shows tooltip
                    mode: 'index'
                }
            }
        });
        
        // Add custom styling for candlesticks after chart is initialized
        applyCandlestickStyling((window as any).candlestickChart, upColor, upBorderColor, upWickColor, downColor, downBorderColor, downWickColor);
        
        // Additional CSS fix for candlestick width - inject a style tag
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            #candlestick-chart .candlestick {
                max-width: 3px !important;
                width: 3px !important;
            }
            
            #candlestick-chart canvas {
                image-rendering: crisp-edges;
            }
        `;
        document.head.appendChild(styleTag);
        
        // Force redraw with smaller candles
        setTimeout(() => {
            // Trigger resize to force redraw
            window.dispatchEvent(new Event('resize'));
        }, 100);
        
        // Cleanup on component unmount
        return () => {
            if ((window as any).candlestickChart) {
                (window as any).candlestickChart.destroy();
            }
            document.head.removeChild(styleTag);
        };
    }, [chartData, colorScheme]);
    
    // Function to apply professional candlestick styling
    const applyCandlestickStyling = (chart: any, upColor: string, upBorderColor: string, upWickColor: string, 
                                    downColor: string, downBorderColor: string, downWickColor: string) => {
        if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) return;
        
        // Apply styling to the candlestick dataset
        const dataset = chart.data.datasets[0];
        
        // Set candlestick styling properties
        dataset.borderColor = (ctx: any) => {
            if (!ctx || !ctx.raw) return 'rgba(0, 0, 0, 0.1)';
            return ctx.raw.c >= ctx.raw.o ? upBorderColor : downBorderColor;
        };
        
        dataset.backgroundColor = (ctx: any) => {
            if (!ctx || !ctx.raw) return 'rgba(0, 0, 0, 0.1)';
            return ctx.raw.c >= ctx.raw.o ? upColor : downColor;
        };
        
        // Just ensure bars are centered with padding
        if (chart.options && chart.options.scales && chart.options.scales.x) {
            chart.options.scales.x.offset = true;
        }
        
        // Update the chart to apply new styles
        chart.update();
    };
    
    // Component doesn't render anything visible
    return null;
};

// Simple modification to render thinner candlesticks
const modifyCandlestickStyle = () => {
    // Add global style for candlesticks
    const style = document.createElement('style');
    style.textContent = `
        .candlestick-element {
            max-width: 2px !important;
            width: 2px !important;
        }
    `;
    document.head.appendChild(style);
    
    return style;
};

export default StockScreener;
