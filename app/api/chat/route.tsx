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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Simplified context that encourages conversational responses
    const context = `
    You are a helpful AI assistant analyzing a stock chart. Here's the analysis data:
    
    Stock Information:
    ${JSON.stringify(analysis, null, 2)}

    Please provide natural, conversational responses about this specific stock chart.
    Focus on answering the user's question directly without using templates.
    Use the analysis data to provide specific insights about this stock.
    `;

    // Construct chat history
    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [msg.content],
    })) || [];

    // Start chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7, // Increased for more natural responses
        topP: 0.8,
      },
    });

    try {
      const response = await chat.sendMessage([context + "\n\nUser Question: " + message]);
      const responseText = response.response.text();
      
      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      return new Response(
        "I apologize, but I'm having trouble analyzing the chart right now. Could you please try asking your question again?",
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        }
      );
    }
  } catch (error) {
    console.error('General error:', error);
    return new Response(
      "I'm sorry, but I encountered an error. Please try again.",
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
}