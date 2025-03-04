"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StockAnalysisCard } from "@/components/StockAnalysisCard";
import { Loader2, Upload } from "lucide-react";
import { Chat } from "@/components/Chat";
import { Montserrat } from 'next/font/google';
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ImagePreview } from "@/components/ImagePreview";
import { HamburgerButton } from "@/components/HamburgerButton";

interface Analysis {
  stockName: string;
  currentPrice: string;
  weekRange: string;
  volume: string;
  peRatio: string;
  support: string;
  resistance: string;
  trend: string;
  strategies: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  recommendation: string;
}

const montserrat = Montserrat({ subsets: ['latin'] });

export default function Home() {
  const [state, setState] = useState({
    loading: false,
    analysis: null as Analysis | null,
    showFollowUp: false,
    selectedFile: null as File | null,
    isSidebarOpen: true,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setState(prev => ({ ...prev, selectedFile: e.target.files[0] }));
    }
  };

  const handleSubmit = async () => {
    if (!state.selectedFile) {
      alert("Please select an image first");
      return;
    }

    setState(prev => ({ ...prev, loading: true, analysis: null, showFollowUp: false }));

    const formData = new FormData();
    formData.append('image', state.selectedFile);

    try {
      console.log('Sending request to API...');
      const response = await fetch('/api/gen', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', response.status);
      const data = await response.json();
      console.log('Parsed data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setState(prev => ({ ...prev, analysis: data.analysis, showFollowUp: true }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to analyze image: ' + (error as Error).message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#1A1F35] to-[#0F1225]">
      {/* Hamburger Menu Button */}
      <HamburgerButton 
        onClick={() => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))} 
        isOpen={state.isSidebarOpen}
        className="fixed top-4 left-4 z-50"
      />

      {/* Left Sidebar - Analysis */}
      <div 
        className={`sidebar-container transition-transform duration-300 ${
          state.isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-16">
          <div className="flex justify-center items-center mb-8">
            <img 
              src="images/roar-ai-logo.png.jpg" 
              alt="ROAR AI" 
              className="w-32 h-32 object-contain"
            />
          </div>
          
          {/* File Upload */}
          <div className="space-y-4">
            <label 
              htmlFor="chart-upload" 
              className={`
                border-2 border-dashed border-[#2A3558] rounded-lg p-8
                flex flex-col items-center justify-center gap-4 
                cursor-pointer hover:border-[#3B4875] transition-colors
                ${state.selectedFile ? 'bg-[#2A3558]/30' : 'bg-[#2A3558]/10'}
              `}
            >
              <Upload className="w-8 h-8 text-[#FF6B6B]" />
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  {state.selectedFile ? state.selectedFile.name : 'Upload stock chart image'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click or drag and drop
                </p>
              </div>
              <Input
                id="chart-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <Button 
              onClick={handleSubmit}
              disabled={state.loading || !state.selectedFile}
              className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FFB168] hover:opacity-90 text-white"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze Chart'
              )}
            </Button>
          </div>

          {/* Analysis Results */}
          {state.analysis && (
            <div className="space-y-4">
              <CollapsiblePanel title="Chart Preview" defaultOpen={true}>
                {state.selectedFile && (
                  <div className="rounded-lg overflow-hidden bg-gray-800">
                    <ImagePreview 
                      src={URL.createObjectURL(state.selectedFile)} 
                      alt="Uploaded chart"
                    />
                  </div>
                )}
              </CollapsiblePanel>
              <StockAnalysisCard analysis={state.analysis} />
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          state.isSidebarOpen ? 'ml-[400px]' : 'ml-0'
        }`}
      >
        {state.analysis ? (
          <Chat 
            analysis={state.analysis}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-[#FF6B6B] text-6xl font-bold mb-4">🦁</div>
              <p className="text-gray-300 text-lg">Upload a chart to start analysis</p>
              <p className="text-gray-400 text-sm">Let ROAR AI analyze your stock charts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}