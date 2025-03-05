"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

interface ChartDisplayProps {
    chartType: string;
    chartData: any;
    loading: boolean;
    error: string;
    selectedTab: string;
    colorScheme: any;
    transitions: any;
}

// Separate component to handle candlestick chart initialization
const CandlestickChartInitializer = ({ chartData, colorScheme }: { chartData: any, colorScheme: any }) => {
    const chartRef = useRef<any>(null);
    const [drawingState, setDrawingState] = useState({
        isDrawingTrendLine: false,
        isDrawingHorizontalLine: false,
        isPlacingFlag: false,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },
        lines: [] as Array<{
            type: 'trend' | 'horizontal' | 'flag',
            startX: number,
            startY: number,
            endX: number,
            endY: number,
            price?: number,
            flagText?: string
        }>,
        activeDrawingTool: null as 'trend' | 'horizontal' | 'flag' | null,
        hoverInfo: {
            visible: false,
            x: 0,
            y: 0,
            data: null as null | {
                date: Date,
                o: number,
                h: number,
                l: number,
                c: number,
                change?: number,
                changePercent?: string
            }
        }
    });
    
    // Reference to price mapping functions
    const mapPriceFunctions = useRef({
        yToPrice: (y: number, minPrice: number, maxPrice: number, topMargin: number, drawingHeight: number): number => {
            return maxPrice - ((y - topMargin) / drawingHeight) * (maxPrice - minPrice);
        },
        priceToY: (price: number, minPrice: number, maxPrice: number, topMargin: number, drawingHeight: number): number => {
            return topMargin + drawingHeight * (1 - (price - minPrice) / (maxPrice - minPrice));
        }
    });
    
    // Setup mousedown/mousemove/mouseup events for drawing
    useEffect(() => {
        const canvas = document.getElementById('candlestick-chart') as HTMLCanvasElement;
        if (!canvas) return;
        
        const handleMouseDown = (e: MouseEvent) => {
            if (!drawingState.activeDrawingTool) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            setDrawingState(prev => ({
                ...prev,
                isDrawingTrendLine: prev.activeDrawingTool === 'trend',
                isDrawingHorizontalLine: prev.activeDrawingTool === 'horizontal',
                isPlacingFlag: prev.activeDrawingTool === 'flag',
                startPoint: { x, y }
            }));
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Handle drawing if active
            if (drawingState.isDrawingTrendLine || drawingState.isDrawingHorizontalLine) {
                setDrawingState(prev => ({
                    ...prev,
                    endPoint: { 
                        x, 
                        y: prev.isDrawingHorizontalLine ? prev.startPoint.y : y
                    }
                }));
                
                // Redraw candlesticks and all lines
                redrawCanvas();
                return;
            }
            
            // Check if hovering over a candlestick for tooltip
            if (chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
                const data = chartData.datasets[0].data;
                
                // Calculate the same layout parameters as in drawing
                let minPrice = Number.MAX_VALUE;
                let maxPrice = Number.MIN_VALUE;
                
                for (const candle of data) {
                    minPrice = Math.min(minPrice, candle.l);
                    maxPrice = Math.max(maxPrice, candle.h);
                }
                
                const priceRange = maxPrice - minPrice;
                const padding = 0.1 * priceRange;
                minPrice -= padding;
                maxPrice += padding;
                
                const leftMargin = 40;
                const rightMargin = 70;
                const topMargin = 20;
                const bottomMargin = 20;
                
                const drawingWidth = canvas.width - leftMargin - rightMargin;
                const spacing = drawingWidth / data.length;
                const candleWidth = Math.min(spacing * 0.8, 15);
                
                // Find the candle the mouse is over
                let hoveredCandle = null;
                let hoveredCandleIndex = -1;
                
                for (let i = 0; i < data.length; i++) {
                    const candleX = leftMargin + i * spacing + spacing / 2;
                    
                    // Check if mouse is within the candle's x-range
                    if (x >= candleX - candleWidth / 2 - 5 && x <= candleX + candleWidth / 2 + 5) {
                        hoveredCandle = data[i];
                        hoveredCandleIndex = i;
                        break;
                    }
                }
                
                if (hoveredCandle) {
                    // Calculate price change and percent
                    let change = 0;
                    let changePercent = '0.00%';
                    
                    if (hoveredCandleIndex > 0 && data[hoveredCandleIndex - 1]) {
                        const prevClose = data[hoveredCandleIndex - 1].c;
                        change = hoveredCandle.c - prevClose;
                        changePercent = ((change / prevClose) * 100).toFixed(2) + '%';
                    }
                    
                    // Update hover info
                    setDrawingState(prev => ({
                        ...prev,
                        hoverInfo: {
                            visible: true,
                            x: x,
                            y: y,
                            data: {
                                date: new Date(hoveredCandle.x),
                                o: hoveredCandle.o,
                                h: hoveredCandle.h,
                                l: hoveredCandle.l,
                                c: hoveredCandle.c,
                                change,
                                changePercent
                            }
                        }
                    }));
                    
                    redrawCanvas();
                } else if (drawingState.hoverInfo.visible) {
                    // Hide the tooltip when not over a candle
                    setDrawingState(prev => ({
                        ...prev,
                        hoverInfo: {
                            ...prev.hoverInfo,
                            visible: false
                        }
                    }));
                    
                    redrawCanvas();
                }
            }
        };
        
        const handleMouseLeave = () => {
            // Hide the tooltip when mouse leaves the canvas
            if (drawingState.hoverInfo.visible) {
                setDrawingState(prev => ({
                    ...prev,
                    hoverInfo: {
                        ...prev.hoverInfo,
                        visible: false
                    }
                }));
                
                redrawCanvas();
            }
        };
        
        const handleMouseUp = (e: MouseEvent) => {
            if (!drawingState.isDrawingTrendLine && !drawingState.isDrawingHorizontalLine && !drawingState.isPlacingFlag) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate price at the horizontal line if applicable
            let price: number | undefined = undefined;
            if (drawingState.isDrawingHorizontalLine || drawingState.isPlacingFlag) {
                // These values need to match what's used in the main drawing function
                const ctx = document.getElementById('candlestick-chart') as HTMLCanvasElement;
                if (ctx && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
                    const data = chartData.datasets[0].data;
                    
                    let minPrice = Number.MAX_VALUE;
                    let maxPrice = Number.MIN_VALUE;
                    
                    for (const candle of data) {
                        minPrice = Math.min(minPrice, candle.l);
                        maxPrice = Math.max(maxPrice, candle.h);
                    }
                    
                    const priceRange = maxPrice - minPrice;
                    const padding = 0.1 * priceRange;
                    minPrice -= padding;
                    maxPrice += padding;
                    
                    const topMargin = 20;
                    const drawingHeight = ctx.height - topMargin - 20; // 20 is bottomMargin
                    
                    // Calculate price from Y coordinate
                    const yPos = drawingState.isDrawingHorizontalLine ? drawingState.startPoint.y : y;
                    price = mapPriceFunctions.current.yToPrice(yPos, minPrice, maxPrice, topMargin, drawingHeight);
                }
            }
            
            let flagText = "";
            if (drawingState.isPlacingFlag) {
                flagText = prompt("Enter flag note (optional):", "") || "";
            }
            
            setDrawingState(prev => ({
                ...prev,
                isDrawingTrendLine: false,
                isDrawingHorizontalLine: false,
                isPlacingFlag: false,
                endPoint: { 
                    x, 
                    y: prev.isDrawingHorizontalLine ? prev.startPoint.y : y
                },
                lines: [...prev.lines, {
                    type: prev.isDrawingTrendLine ? 'trend' : prev.isDrawingHorizontalLine ? 'horizontal' : 'flag',
                    startX: prev.startPoint.x,
                    startY: prev.startPoint.y,
                    endX: prev.isPlacingFlag ? prev.startPoint.x : x,
                    endY: prev.isDrawingHorizontalLine ? prev.startPoint.y : 
                           prev.isPlacingFlag ? prev.startPoint.y : y,
                    price,
                    flagText
                }]
            }));
            
            redrawCanvas();
        };
        
        // Function to redraw the entire canvas including candlesticks and drawing tools
        const redrawCanvas = () => {
            // This function will be called within the useEffect
            // It will force the main drawing useEffect to re-execute
            if (chartData) {
                // Create a shallow copy to trigger useEffect
                const updatedChartData = { ...chartData };
                chartRef.current = updatedChartData;
                // Need to manually trigger the drawing code
                drawCandlestickChart(updatedChartData);
            }
        };
        
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [drawingState, chartData]);
    
    // Function to draw the complete chart including candlesticks and drawing tools
    const drawCandlestickChart = (chartData: any) => {
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return;
        
        // Get the canvas element
        const ctx = document.getElementById('candlestick-chart') as HTMLCanvasElement;
        if (!ctx) {
            console.error("Candlestick chart canvas not found");
            return;
        }
        
        // Ensure canvas size matches its display size
        const containerDiv = ctx.parentElement;
        if (containerDiv) {
            ctx.width = containerDiv.clientWidth;
            ctx.height = containerDiv.clientHeight;
        }
        
        // Use consistent colors
        const upColor = 'rgba(0, 150, 136, 0.9)'; // More opaque green
        const upBorderColor = 'rgba(0, 150, 136, 1)';
        const downColor = 'rgba(239, 83, 80, 0.9)'; // More opaque red
        const downBorderColor = 'rgba(239, 83, 80, 1)';
        const gridColor = 'rgba(255, 255, 255, 0.15)';
        const textColor = '#FFFFFF';
        const trendLineColor = 'rgba(255, 165, 0, 1)'; // Orange for trend lines
        const horizontalLineColor = 'rgba(147, 112, 219, 1)'; // Purple for horizontal lines
        const flagColor = 'rgba(255, 215, 0, 1)'; // Gold for flags
        
        // Keep it simple - just draw rectangles for candlesticks
        if (chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data) {
            const canvas = ctx.getContext('2d');
            if (!canvas) {
                console.error("Could not get 2D context");
                return;
            }
            
            // Log the data to ensure it has the proper structure
            const data = chartData.datasets[0].data;
            
            if (!data || data.length === 0) {
                console.error("No candlestick data to render");
                return;
            }
            
            // Clear canvas
            canvas.clearRect(0, 0, ctx.width, ctx.height);
            canvas.fillStyle = '#121826';
            canvas.fillRect(0, 0, ctx.width, ctx.height);
            
            // Draw grid
            canvas.strokeStyle = gridColor;
            canvas.lineWidth = 0.5;
            
            // Horizontal grid lines
            const horizontalLines = 10;
            for (let i = 0; i <= horizontalLines; i++) {
                canvas.beginPath();
                const y = i * (ctx.height / horizontalLines);
                canvas.moveTo(0, y);
                canvas.lineTo(ctx.width, y);
                canvas.stroke();
            }
            
            // Vertical grid lines
            const verticalLines = Math.min(20, data.length);
            for (let i = 0; i <= verticalLines; i++) {
                canvas.beginPath();
                const x = i * (ctx.width / verticalLines);
                canvas.moveTo(x, 0);
                canvas.lineTo(x, ctx.height);
                canvas.stroke();
            }
            
            // Find min/max for scaling
            let minPrice = Number.MAX_VALUE;
            let maxPrice = Number.MIN_VALUE;
            
            for (const candle of data) {
                minPrice = Math.min(minPrice, candle.l);
                maxPrice = Math.max(maxPrice, candle.h);
            }
            
            // Add some padding to the price range
            const priceRange = maxPrice - minPrice;
            const padding = 0.1 * priceRange;
            minPrice -= padding;
            maxPrice += padding;
            
            // Leave margin at the edges
            const leftMargin = 40;
            const rightMargin = 70;
            const topMargin = 20;
            const bottomMargin = 20;
            
            // Calculate drawing area
            const drawingWidth = ctx.width - leftMargin - rightMargin;
            const drawingHeight = ctx.height - topMargin - bottomMargin;
            
            // Calculate candle spacing and width
            const spacing = drawingWidth / data.length;
            const candleWidth = Math.min(spacing * 0.8, 15);
            
            // Draw candles
            data.forEach((candle: any, i: number) => {
                // Skip invalid data
                if (typeof candle.o !== 'number' || typeof candle.h !== 'number' || 
                    typeof candle.l !== 'number' || typeof candle.c !== 'number') {
                    return;
                }
                
                // Calculate x position (center of candle)
                const x = leftMargin + i * spacing + spacing / 2;
                
                // Map price to canvas coordinates
                const yHigh = topMargin + drawingHeight * (1 - (candle.h - minPrice) / (maxPrice - minPrice));
                const yLow = topMargin + drawingHeight * (1 - (candle.l - minPrice) / (maxPrice - minPrice));
                const yOpen = topMargin + drawingHeight * (1 - (candle.o - minPrice) / (maxPrice - minPrice));
                const yClose = topMargin + drawingHeight * (1 - (candle.c - minPrice) / (maxPrice - minPrice));
                
                // Determine if bullish or bearish
                const isBullish = candle.c >= candle.o;
                
                // Draw wick (high to low)
                canvas.strokeStyle = isBullish ? upBorderColor : downBorderColor;
                canvas.lineWidth = 1;
                canvas.beginPath();
                canvas.moveTo(x, yHigh);
                canvas.lineTo(x, yLow);
                canvas.stroke();
                
                // Draw body (open to close)
                canvas.fillStyle = isBullish ? upColor : downColor;
                const bodyTop = Math.min(yOpen, yClose);
                const bodyBottom = Math.max(yOpen, yClose);
                const bodyHeight = Math.max(1, bodyBottom - bodyTop); // Ensure at least 1px height
                
                canvas.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
                
                // Draw border around body
                canvas.strokeStyle = isBullish ? upBorderColor : downBorderColor;
                canvas.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
            });
            
            // Draw all saved lines
            drawingState.lines.forEach(line => {
                canvas.beginPath();
                
                if (line.type === 'trend') {
                    // Trend line
                    canvas.strokeStyle = trendLineColor;
                    canvas.lineWidth = 2;
                    canvas.setLineDash([]);
                    canvas.moveTo(line.startX, line.startY);
                    canvas.lineTo(line.endX, line.endY);
                    canvas.stroke();
                } else if (line.type === 'horizontal') {
                    // Horizontal line (support/resistance)
                    canvas.strokeStyle = horizontalLineColor;
                    canvas.lineWidth = 2;
                    canvas.setLineDash([5, 3]); // Dashed line for horizontal lines
                    canvas.moveTo(0, line.startY);
                    canvas.lineTo(ctx.width, line.startY);
                    canvas.stroke();
                    canvas.setLineDash([]);
                    
                    // Add price label for horizontal line
                    if (line.price) {
                        canvas.fillStyle = horizontalLineColor;
                        canvas.font = 'bold 12px Arial';
                        canvas.textAlign = 'left';
                        canvas.fillText(`₹${line.price.toFixed(2)}`, 5, line.startY - 5);
                    }
                } else if (line.type === 'flag') {
                    // Flag indicator
                    const flagSize = 15;
                    canvas.fillStyle = flagColor;
                    
                    // Draw flag pole
                    canvas.lineWidth = 2;
                    canvas.strokeStyle = flagColor;
                    canvas.beginPath();
                    canvas.moveTo(line.startX, line.startY);
                    canvas.lineTo(line.startX, line.startY - 40); // Fixed height pole
                    canvas.stroke();
                    
                    // Draw triangular flag
                    canvas.beginPath();
                    canvas.moveTo(line.startX, line.startY - 40);
                    canvas.lineTo(line.startX + 20, line.startY - 30);
                    canvas.lineTo(line.startX, line.startY - 20);
                    canvas.fill();
                    
                    // Add flag text if available
                    if (line.flagText) {
                        canvas.fillStyle = textColor;
                        canvas.font = '11px Arial';
                        canvas.textAlign = 'left';
                        canvas.fillText(line.flagText, line.startX + 25, line.startY - 30);
                    }
                    
                    // Add price if available
                    if (line.price) {
                        canvas.fillStyle = flagColor;
                        canvas.font = 'bold 11px Arial';
                        canvas.textAlign = 'right';
                        canvas.fillText(`₹${line.price.toFixed(2)}`, line.startX - 5, line.startY - 25);
                    }
                }
            });
            
            // Draw currently active drawing if any
            if (drawingState.isDrawingTrendLine || drawingState.isDrawingHorizontalLine) {
                canvas.beginPath();
                if (drawingState.isDrawingTrendLine) {
                    canvas.strokeStyle = trendLineColor;
                    canvas.lineWidth = 2;
                    canvas.setLineDash([]);
                    canvas.moveTo(drawingState.startPoint.x, drawingState.startPoint.y);
                    canvas.lineTo(drawingState.endPoint.x, drawingState.endPoint.y);
                } else if (drawingState.isDrawingHorizontalLine) {
                    canvas.strokeStyle = horizontalLineColor;
                    canvas.lineWidth = 2;
                    canvas.setLineDash([5, 3]);
                    canvas.moveTo(0, drawingState.startPoint.y);
                    canvas.lineTo(ctx.width, drawingState.startPoint.y);
                    canvas.setLineDash([]);
                    
                    // Show price while drawing
                    if (drawingState.startPoint.y > 0) {
                        const price = mapPriceFunctions.current.yToPrice(
                            drawingState.startPoint.y, 
                            minPrice, 
                            maxPrice, 
                            topMargin, 
                            drawingHeight
                        );
                        
                        if (price) {
                            canvas.fillStyle = horizontalLineColor;
                            canvas.font = 'bold 12px Arial';
                            canvas.textAlign = 'left';
                            canvas.fillText(`₹${price.toFixed(2)}`, 5, drawingState.startPoint.y - 5);
                        }
                    }
                }
                canvas.stroke();
            }
            
            // Draw hover tooltip if active
            if (drawingState.hoverInfo.visible && drawingState.hoverInfo.data) {
                const hoverData = drawingState.hoverInfo.data;
                const tooltipX = drawingState.hoverInfo.x;
                const tooltipY = drawingState.hoverInfo.y;
                
                // Format the date
                const dateStr = hoverData.date.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                // Determine tooltip position to keep it in viewport
                let tx = tooltipX + 15;
                const tooltipWidth = 180;
                const tooltipHeight = 120;
                
                // Adjust position if too close to right edge
                if (tx + tooltipWidth > ctx.width) {
                    tx = tooltipX - tooltipWidth - 15;
                }
                
                // Adjust position if too close to bottom edge
                let ty = tooltipY;
                if (ty + tooltipHeight > ctx.height) {
                    ty = ctx.height - tooltipHeight - 10;
                }
                
                // Draw tooltip background with shadow
                canvas.save();
                canvas.shadowColor = 'rgba(0, 0, 0, 0.5)';
                canvas.shadowBlur = 10;
                canvas.shadowOffsetX = 2;
                canvas.shadowOffsetY = 2;
                
                // Semi-transparent background
                canvas.fillStyle = 'rgba(25, 30, 45, 0.95)';
                canvas.beginPath();
                canvas.roundRect(tx, ty, tooltipWidth, tooltipHeight, 4);
                canvas.fill();
                canvas.restore();
                
                // Add border
                canvas.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                canvas.lineWidth = 1;
                canvas.beginPath();
                canvas.roundRect(tx, ty, tooltipWidth, tooltipHeight, 4);
                canvas.stroke();
                
                // Draw tooltip contents
                canvas.fillStyle = '#FFFFFF';
                canvas.font = 'bold 12px Arial';
                canvas.textAlign = 'left';
                canvas.fillText(dateStr, tx + 10, ty + 20);
                
                // Draw price information
                canvas.font = '12px Arial';
                
                // Set text color based on price change direction
                const isPositive = (hoverData.change || 0) >= 0;
                
                canvas.fillText(`Open:   ₹${hoverData.o.toFixed(2)}`, tx + 10, ty + 40);
                canvas.fillText(`High:   ₹${hoverData.h.toFixed(2)}`, tx + 10, ty + 60);
                canvas.fillText(`Low:    ₹${hoverData.l.toFixed(2)}`, tx + 10, ty + 80);
                
                // Close price with color indication
                canvas.fillStyle = isPositive ? upColor : downColor;
                canvas.fillText(`Close:  ₹${hoverData.c.toFixed(2)}`, tx + 10, ty + 100);
                
                // Draw change info if available
                if (hoverData.change !== undefined && hoverData.changePercent) {
                    const changeText = `${isPositive ? '+' : ''}${hoverData.change.toFixed(2)} (${hoverData.changePercent})`;
                    canvas.fillText(changeText, tx + 10, ty + 120);
                }
            }
            
            // Add price labels on the right
            canvas.fillStyle = textColor;
            canvas.font = '11px Arial';
            canvas.textAlign = 'right';
            
            const priceLabels = 6;
            for (let i = 0; i <= priceLabels; i++) {
                const price = minPrice + (i / priceLabels) * (maxPrice - minPrice);
                const y = topMargin + (1 - i / priceLabels) * drawingHeight;
                canvas.fillText(`₹${price.toFixed(2)}`, ctx.width - 10, y + 4);
            }
            
            // Add date labels at the bottom
            if (data.length > 0 && data[0].x) {
                canvas.textAlign = 'center';
                const dateLabels = Math.min(5, data.length);
                
                for (let i = 0; i < dateLabels; i++) {
                    const dataIndex = Math.floor(i * (data.length - 1) / (dateLabels - 1));
                    if (data[dataIndex] && data[dataIndex].x) {
                        const date = new Date(data[dataIndex].x);
                        const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        const x = leftMargin + dataIndex * spacing + spacing / 2;
                        canvas.fillText(dateStr, x, ctx.height - 5);
                    }
                }
            }
        }
    };
    
    useEffect(() => {
        // Initial drawing and setup
        drawCandlestickChart(chartData);
    }, [chartData, colorScheme]);
    
    // Render toolbar and canvas
    return (
        <>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                padding: '4px 10px', 
                backgroundColor: '#1A2133',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        style={{ 
                            background: drawingState.activeDrawingTool === 'trend' ? '#3A4559' : 'transparent', 
                            color: '#fff', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: '4px', 
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }} 
                        onClick={() => setDrawingState(prev => ({
                            ...prev,
                            activeDrawingTool: prev.activeDrawingTool === 'trend' ? null : 'trend'
                        }))}
                    >
                        <span style={{ fontSize: '14px' }}>📈</span> Trend Line
                    </button>
                    
                    <button 
                        style={{ 
                            background: drawingState.activeDrawingTool === 'horizontal' ? '#3A4559' : 'transparent', 
                            color: '#fff', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: '4px', 
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }} 
                        onClick={() => setDrawingState(prev => ({
                            ...prev,
                            activeDrawingTool: prev.activeDrawingTool === 'horizontal' ? null : 'horizontal'
                        }))}
                    >
                        <span style={{ fontSize: '14px' }}>⏸️</span> Horizontal Line
                    </button>
                    
                    <button 
                        style={{ 
                            background: drawingState.activeDrawingTool === 'flag' ? '#3A4559' : 'transparent', 
                            color: '#fff', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: '4px', 
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }} 
                        onClick={() => setDrawingState(prev => ({
                            ...prev,
                            activeDrawingTool: prev.activeDrawingTool === 'flag' ? null : 'flag'
                        }))}
                    >
                        <span style={{ fontSize: '14px' }}>🚩</span> Flag
                    </button>
                    
                    <button 
                        style={{ 
                            background: 'rgba(255, 59, 48, 0.2)', 
                            color: '#ff3b30', 
                            border: '1px solid rgba(255, 59, 48, 0.4)', 
                            borderRadius: '4px', 
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginLeft: '10px'
                        }} 
                        onClick={() => {
                            setDrawingState(prev => ({
                                ...prev,
                                lines: [],
                                activeDrawingTool: null,
                                isDrawingTrendLine: false,
                                isDrawingHorizontalLine: false,
                                isPlacingFlag: false
                            }));
                            drawCandlestickChart(chartData);
                        }}
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </>
    );
};

const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
    chartType, 
    chartData, 
    loading, 
    error, 
    selectedTab, 
    colorScheme,
    transitions
}) => {
    return (
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
                            backgroundColor: '#121826',
                            borderRadius: '4px',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                        }}>
                            <canvas 
                                id="candlestick-chart" 
                                width="100%" 
                                height="100%" 
                                style={{ display: 'block', width: '100%', height: '100%' }}
                            ></canvas>
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
    );
};

export default ChartDisplay; 