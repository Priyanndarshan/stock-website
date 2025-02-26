'use client';

export default function Home() {
  return (
    <main>
      <div className="header">
        <h1>Chart AI</h1>
      </div>
      
      <div className="container">
        <div className="upload-section">
          <p className="upload-text">Screenshot 2025-02-25 114821.png</p>
          <p className="upload-text">Click or drag and drop</p>
        </div>
        
        <button className="analyze-button">Analyze Chart</button>
        
        <div className="card">
          <h2>Chart Preview</h2>
        </div>
        
        <div className="card">
          <h2>Key Insights</h2>
        </div>
        
        <div className="card">
          <h2>Trading Strategies</h2>
        </div>
        
        <div className="card">
          <h2>Final Recommendation</h2>
        </div>
        
        <div className="card">
          <h2>News</h2>
        </div>
      </div>
    </main>
  );
} 