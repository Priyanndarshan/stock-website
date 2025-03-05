"use client"

import React from 'react';
import Image from 'next/image';
interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    colorScheme: any;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, colorScheme }) => {
    return (
        <header style={{ 
            backgroundColor: colorScheme.cardBg, 
            padding: "15px 20px", 
            borderBottom: `1px solid ${colorScheme.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <Image src="/assests/roarAI.png" alt="Logo" width={150} height={50} />
            </div>
            
        </header>
    );
};

export default Header; 