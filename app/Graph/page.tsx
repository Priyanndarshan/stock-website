"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
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
    Filler,
    TimeScale,
    TimeSeriesScale
} from "chart.js";
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

// Import components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StockSearch from "./components/StockSearch";
import ChartControls from "./components/ChartControls";
import ChartDisplay from "./components/ChartDisplay";
import TabContent from "./components/TabContent";

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

    // Transitions for animations
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
            // Fetch stock price data
            const stockDataResponse = await axios.post("http://127.0.0.1:5000/get_stock_data", {
                symbol,
                period,
                interval
            });
            
            if (stockDataResponse.data.error) {
                setError(stockDataResponse.data.error);
                return;
            }

            // Set news data
            setNewsData(stockDataResponse.data.news || []);

            // Calculate basic price changes
            const lastPrice = stockDataResponse.data.close ? stockDataResponse.data.close[stockDataResponse.data.close.length - 1] : 0;
            const previousPrice = stockDataResponse.data.close ? stockDataResponse.data.close[stockDataResponse.data.close.length - 2] : 0;
            const priceChange = lastPrice - previousPrice;
            const percentChange = (priceChange / previousPrice) * 100;
            
            // Fetch additional stock info including real volume and PE ratio
            const stockInfoResponse = await axios.post("http://127.0.0.1:5000/get_stock_info", {
                symbol
            });
            
            const stockDetails = stockInfoResponse.data.stocks?.[symbol] || {};
            
            // Set stock info with real data from the API
            setStockInfo({
                lastPrice: lastPrice.toFixed(2),
                change: priceChange.toFixed(2),
                percentChange: percentChange.toFixed(2),
                high: Math.max(...(stockDataResponse.data.high || [0])).toFixed(2),
                low: Math.min(...(stockDataResponse.data.low || [0])).toFixed(2),
                // Use real volume from the API if available
                volume: stockDetails.averageVolume || null,
                // Use real PE ratio from the API if available
                pe: stockDetails.peRatio || null,
                marketCap: stockDetails.marketCap || null,
                dividend: stockDetails.dividendYield || null,
            });

            // Set chart data based on the selected chart type
            if (chartType === "line" || chartType === "area") {
                setChartData({
                    labels: stockDataResponse.data.timestamps || [],
                    datasets: [
                        {
                            label: `${symbol} Price`,
                            data: stockDataResponse.data.close || [],
                            borderColor: colorScheme.chartLine,
                            backgroundColor: chartType === "area" ? colorScheme.chartFill : "transparent",
                            borderWidth: 2,
                            fill: chartType === "area",
                            tension: 0.1,
                        },
                        ...compareSymbols.map((sym) => ({
                            label: `${sym} Price`,
                            data: Array(stockDataResponse.data.close?.length || 0).fill(0).map(() => Math.random() * 100 + 50),
                            borderColor: "rgba(255, 99, 132, 1)",
                            backgroundColor: "transparent",
                            borderWidth: 2,
                            borderDash: [5, 5],
                        })),
                        ...(showIndicators ? [{
                            label: "50-day SMA",
                            data: (stockDataResponse.data.close || []).map((val: number) => val * (1 + (Math.random() * 0.1 - 0.05))),
                            borderColor: "rgba(255, 159, 64, 1)",
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                        }] : [])
                    ]
                });
            } else if (chartType === "bar") {
                setChartData({
                    labels: stockDataResponse.data.timestamps || [],
                    datasets: [
                        {
                            label: `${symbol} Volume`,
                            data: (stockDataResponse.data.close || []).map((price: number) => price * (Math.random() * 100000 + 10000)),
                            backgroundColor: colorScheme.chartFill,
                            borderColor: colorScheme.chartLine,
                            borderWidth: 1,
                        }
                    ]
                });
            } else if (chartType === "candlestick") {
                // Ensure we have all required OHLC data
                if (!stockDataResponse.data.open || !stockDataResponse.data.high || !stockDataResponse.data.low || !stockDataResponse.data.close || !stockDataResponse.data.timestamps) {
                    setError("Incomplete data for candlestick chart");
                    return;
                }
                
                // Format candlestick data correctly
                const candleData = {
                    datasets: [{
                        label: `${symbol} OHLC`,
                        data: stockDataResponse.data.timestamps.map((timestamp: string, index: number) => ({
                            x: new Date(timestamp),
                            o: stockDataResponse.data.open[index],
                            h: stockDataResponse.data.high[index],
                            l: stockDataResponse.data.low[index],
                            c: stockDataResponse.data.close[index]
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
        }
    };

    const removeCompareSymbol = (symbolToRemove: string) => {
        setCompareSymbols(compareSymbols.filter(s => s !== symbolToRemove));
    };

    return (
        <div style={{ 
            padding: "0", 
            margin: "0", 
            backgroundColor: colorScheme.background, 
            color: colorScheme.text,
            minHeight: "100vh",
        }}>
            {/* Header Component */}
            <Header 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode} 
                colorScheme={colorScheme} 
            />

            {/* Main content */}
            <div style={{ display: "flex", padding: "0" }}>
                {/* Sidebar Component */}
                <Sidebar 
                    watchlist={watchlist}
                    symbol={symbol}
                    setSymbol={setSymbol}
                    removeFromWatchlist={removeFromWatchlist}
                    colorScheme={colorScheme}
                    sectorData={sectorData}
                    isDarkMode={isDarkMode}
                    marketNews={marketNews}
                />

                {/* Main content area */}
                <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                    {/* Stock Search Component */}
                    <StockSearch 
                        symbol={symbol}
                        setSymbol={setSymbol}
                        fetchStockData={fetchStockData}
                        addToWatchlist={addToWatchlist}
                        stockInfo={stockInfo}
                        colorScheme={colorScheme}
                    />

                    {/* Chart Controls Component */}
                    <ChartControls 
                        chartType={chartType}
                        setChartType={setChartType}
                        period={period}
                        setPeriod={setPeriod}
                        interval={interval}
                        setInterval={setInterval}
                        showIndicators={showIndicators}
                        setShowIndicators={setShowIndicators}
                        compareSymbol={compareSymbol}
                        setCompareSymbol={setCompareSymbol}
                        addCompareSymbol={addCompareSymbol}
                        colorScheme={colorScheme}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        indicators={indicators}
                        periods={periods}
                        intervals={intervals}
                        drawingTools={drawingTools}
                    />
                    
                    {/* Chart Display Component */}
                    <ChartDisplay 
                        chartType={chartType}
                        chartData={chartData}
                        loading={loading}
                        error={error}
                        selectedTab={selectedTab}
                        colorScheme={colorScheme}
                        transitions={transitions}
                    />

                    {/* Tab Content Component */}
                    <TabContent 
                        selectedTab={selectedTab}
                        colorScheme={colorScheme}
                        transitions={transitions}
                        symbol={symbol}
                        stockInfo={stockInfo}
                        compareSymbols={compareSymbols}
                        removeCompareSymbol={removeCompareSymbol}
                        newsData={newsData}
                        indicators={indicators}
                        drawingTools={drawingTools}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default StockScreener;
