"use client"

import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface SidebarProps {
    watchlist: string[];
    symbol: string;
    setSymbol: (symbol: string) => void;
    removeFromWatchlist: (stock: string) => void;
    colorScheme: any;
    sectorData: any;
    isDarkMode: boolean;
    marketNews: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
    watchlist, 
    symbol, 
    setSymbol, 
    removeFromWatchlist, 
    colorScheme,
    sectorData,
    isDarkMode,
    marketNews
}) => {
    return (
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

        </div>
    );
};

export default Sidebar; 