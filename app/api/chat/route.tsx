import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    console.log('Chat API route called');
    const { message, analysis } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "No message was provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Ensure analysis is not null and has default values for missing fields
    const safeAnalysis = analysis || {};
    const stockName = safeAnalysis.name || safeAnalysis.stockName || 'the stock';
    const stockSymbol = safeAnalysis.stockSymbol || 'unknown';
    
    // Safely extract other analysis properties with fallbacks
    const currentPrice = safeAnalysis.currentPrice || 'Not available';
    const volume = safeAnalysis.volume || 'Not available';
    const peRatio = safeAnalysis.peRatio || 'Not available';
    const support = safeAnalysis.support || 'Not available';
    const resistance = safeAnalysis.resistance || 'Not available';
    const trend = safeAnalysis.trend || 'Not available';
    
    // Handle potentially nested or missing properties
    const strategies = safeAnalysis.strategies || {};
    const shortTerm = strategies.shortTerm || 'Not available';
    const mediumTerm = strategies.mediumTerm || 'Not available';
    const longTerm = strategies.longTerm || 'Not available';
    
    const recommendation = safeAnalysis.recommendation || 'Not available';

    // Extract live data if available
    const liveData = safeAnalysis.liveData || {};
    const isLiveData = safeAnalysis.isLiveData || false;
    
    // Use live data if available, otherwise use the standard analysis data
    const displayedPrice = currentPrice !== 'N/A' ? currentPrice : '(Price data not available)';
    const displayedVolume = volume !== 'N/A' ? volume : '(Volume data not available)';
    const dayChange = safeAnalysis.dayChange || 'Not available';
    const dayChangePercent = safeAnalysis.dayChangePercent || 'Not available';
    const lastUpdated = safeAnalysis.lastUpdated ? new Date(safeAnalysis.lastUpdated).toLocaleTimeString() : 'Not available';
    
    // For growth questions, provide more specific information
    const isGrowthQuestion = message.toLowerCase().includes('growth') || 
                             message.toLowerCase().includes('increase') || 
                             message.toLowerCase().includes('performance') ||
                             message.toLowerCase().includes('change');
    
    // Get data for growth-specific responses
    const growthInfo = isGrowthQuestion ? `
    The stock is currently showing a ${trend} pattern.
    ${dayChange !== 'Not available' ? `Today's change: ${dayChange} ${dayChangePercent}` : ''}
    ${support !== 'N/A' && resistance !== 'N/A' ? `The stock is trading between support at ${support} and resistance at ${resistance}.` : ''}
    ${currentPrice !== 'N/A' && support !== 'N/A' ? `Current price (${currentPrice}) is ${parseFloat(currentPrice) > parseFloat(support) ? 'above' : 'below'} support level (${support}).` : ''}
    ${currentPrice !== 'N/A' && resistance !== 'N/A' ? `Current price (${currentPrice}) is ${parseFloat(currentPrice) < parseFloat(resistance) ? 'below' : 'above'} resistance level (${resistance}).` : ''}
    ` : '';

    // Create a prompt that includes the available analysis data for context
    const prompt = `You are a helpful financial advisor assistant named ROAR AI. The user is analyzing a stock chart for ${stockName} (symbol: ${stockSymbol}). 
    
    Here's the available analysis data${isLiveData ? ' (LIVE DATA as of ' + lastUpdated + ')' : ''}:
    
    - Current Price: ${displayedPrice}
    - Volume: ${displayedVolume}${isLiveData ? `
    - Day Change: ${dayChange} (${dayChangePercent})` : ''}
    - P/E Ratio: ${peRatio}
    - Support Level: ${support}
    - Resistance Level: ${resistance}
    - Trend: ${trend}
    ${strategies ? `- Trading Strategies: ${shortTerm}, ${mediumTerm}, ${longTerm}` : ''}
    - Recommendation: ${recommendation}
    ${growthInfo}
    
    The user is asking: "${message}"
    
    ${isGrowthQuestion ? 'The user is asking about growth or performance. Focus on the trend, price changes, and relationship to support/resistance levels.' : ''}
    ${isLiveData ? 'Important: This is live market data that was just retrieved from the chart. Make sure to emphasize this is current market information in your response.' : ''}
    
    Provide a helpful, concise response focusing on the analysis data and the user's question. If you don't know something or if the data isn't available, be honest about it. Format your response using markdown for readability. Keep your answer focused on the financial analysis of the stock.`;

    // Call the Gemini API
    console.log('Calling Gemini API for chat...');
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log('Response received from Gemini');
      return NextResponse.json({ message: text });
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      
      // Fallback response if the API fails
      let fallbackResponse = `Based on the ${isLiveData ? 'live' : 'current'} stock analysis, I can provide some insights.`;
      
      if (currentPrice !== 'N/A') {
        fallbackResponse += ` The stock is currently trading at ${displayedPrice}`;
        
        if (dayChange !== 'Not available' && dayChangePercent !== 'Not available') {
          fallbackResponse += ` with a change of ${dayChange} (${dayChangePercent}) today`;
        }
      }
      
      if (volume !== 'N/A') {
        fallbackResponse += ` and ${displayedVolume} volume`;
      }
      
      if (support !== 'N/A' && resistance !== 'N/A') {
        fallbackResponse += `. Support level is at ${support} and resistance at ${resistance}`;
      }
      
      if (trend !== 'Not available') {
        fallbackResponse += `. The overall trend appears to be ${trend}`;
      }
      
      fallbackResponse += `.`;
      
      if (isGrowthQuestion) {
        if (trend !== 'Not available') {
          fallbackResponse += ` Regarding growth, the ${trend} trend indicates `;
          
          if (trend.toLowerCase().includes('up')) {
            fallbackResponse += `positive momentum in the stock price.`;
          } else if (trend.toLowerCase().includes('down')) {
            fallbackResponse += `negative momentum in the stock price.`;
          } else {
            fallbackResponse += `a lack of clear directional movement.`;
          }
        }
      }
      
      fallbackResponse += ` For more specific details about your question, I recommend looking at the live chart.`;
      
      if (isLiveData && lastUpdated !== 'Not available') {
        fallbackResponse += ` This information was retrieved from the live chart at ${lastUpdated}.`;
      }
      
      return NextResponse.json({ message: fallbackResponse });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    // Return a user-friendly error message
    return NextResponse.json(
      { message: "I apologize, but I'm having trouble analyzing this data right now. Could you try asking in a different way? The most reliable information is available on the live chart." },
      { status: 200 } // Return 200 to prevent client-side error handling
    );
  }
}