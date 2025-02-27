import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    console.log('API route called');
    const data = await req.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      console.error('Error: No file provided in the request');
      return NextResponse.json(
        { error: "No image file was provided. Please upload a valid image." },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, file.type);

    // Convert image to bytes
    const bytes = await file.arrayBuffer();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log('Calling Gemini API...');
    const prompt = `Analyze this stock chart image in detail and provide a structured analysis. Return ONLY a valid JSON object with the following structure:
    {
      "stockName": "extract the exact stock name/symbol from the chart",
      "currentPrice": "exact current price",
      "weekRange": "52-week price range",
      "volume": "current trading volume",
      "peRatio": "current P/E ratio",
      "support": "key support level",
      "resistance": "key resistance level",
      "trend": "Uptrend/Downtrend/Sideways",
      "strategies": {
        "shortTerm": "detailed 1-3 month strategy",
        "mediumTerm": "detailed 3-6 month strategy",
        "longTerm": "detailed 6+ month strategy"
      },
      "recommendation": "final investment recommendation"
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: Buffer.from(bytes).toString('base64')
        }
      }
    ]);

    console.log('Gemini API response received');
    const response = await result.response;
    let text = response.text();
    console.log('Raw response:', text);
    
    try {
      // Find JSON content between curly braces
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      
      const jsonText = jsonMatch[0].replace(/[\u201C\u201D]/g, '"'); // Replace smart quotes
      let analysis;
      try {
        analysis = JSON.parse(jsonText);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        return NextResponse.json(
          { error: "Failed to parse analysis results." },
          { status: 500 }
        );
      }

      // Validate required fields and their types
      const requiredFields = [
        'stockName', 'currentPrice', 'weekRange', 'volume', 'peRatio',
        'support', 'resistance', 'trend', 'strategies', 'recommendation'
      ];

      const missingFields = requiredFields.filter(field => !analysis[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure trend is one of the allowed values
      if (!['Uptrend', 'Downtrend', 'Sideways'].includes(analysis.trend)) {
        analysis.trend = 'Sideways'; // Default to sideways if invalid
      }

      console.log('Analysis processed successfully');
      return NextResponse.json({ analysis });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return NextResponse.json(
        { error: `Failed to parse analysis results: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl'); // Get the image URL from the query parameter
    const prompt = searchParams.get('prompt'); // Get the prompt from the query parameter

    // Return the prompt and image URL as a JSON response
    return NextResponse.json({ prompt, imageUrl });
}
