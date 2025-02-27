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
  trend: "Uptrend" | "Downtrend" | "Sideways";
  strategies: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  recommendation: string;
}

const montserrat = Montserrat({ subsets: ['latin'] });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setShowFollowUp(false);

    const formData = new FormData();
    formData.append('image', selectedFile);

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

      setAnalysis(data.analysis);
      setShowFollowUp(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to analyze image: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1E1E]">
      {/* Hamburger Menu Button */}
      <HamburgerButton 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isOpen={isSidebarOpen}
      />

      {/* Left Sidebar - Analysis */}
      <div 
        className={`sidebar-container fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-16">
          <h1 className={`${montserrat.className} text-4xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent text-center mb-8`}>
            Chart AI
          </h1>
          
          {/* File Upload */}
          <div className="space-y-4">
            <label 
              htmlFor="chart-upload" 
              className={`
                border-2 border-dashed border-gray-700 rounded-lg p-8
                flex flex-col items-center justify-center gap-4 
                cursor-pointer hover:border-gray-600 transition-colors
                ${selectedFile ? 'bg-gray-800/50' : 'bg-gray-800/20'}
              `}
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {selectedFile ? selectedFile.name : 'Upload stock chart image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
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
              disabled={loading || !selectedFile}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors duration-200"
            >
              {loading ? (
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
          {analysis && (
            <div className="space-y-4">
              <CollapsiblePanel title="Chart Preview" defaultOpen={true}>
                {selectedFile && (
                  <div className="rounded-lg overflow-hidden bg-gray-800">
                    <ImagePreview 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Uploaded chart"
                    />
                  </div>
                )}
              </CollapsiblePanel>
              <StockAnalysisCard analysis={analysis} />
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {analysis ? (
          <Chat 
            analysis={analysis} 
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <div className={`flex-1 flex items-center justify-center text-gray-400 transition-all duration-300 ${
            isSidebarOpen ? 'pl-[400px]' : 'pl-0'
          }`}>
            Upload a chart to start the analysis
          </div>
        )}
      </div>
    </div>
  );
}