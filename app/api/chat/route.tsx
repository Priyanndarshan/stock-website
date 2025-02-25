import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, analysis, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct chat context from analysis
    const context = `
    Context about the stock:
    - Current Price: ${analysis.currentPrice}
    - 52-Week Range: ${analysis.weekRange}
    - Volume: ${analysis.volume}
    - P/E Ratio: ${analysis.peRatio}
    - Support Level: ${analysis.support}
    - Resistance Level: ${analysis.resistance}
    - Current Trend: ${analysis.trend}
    `;

    // Construct chat history
    const chatHistory = history.map((msg: any) => ({
      role: msg.role,
      parts: msg.content,
    }));

    // Start new chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const prompt = `
    ${context}
    
    User Question: ${message}
    
    Please provide a detailed and specific answer based on the stock analysis context provided above.
    Focus on technical analysis and actionable insights.`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: "Failed to process chat message: " + (error as Error).message },
      { status: 500 }
    );
  }
} 