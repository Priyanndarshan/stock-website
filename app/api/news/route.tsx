import { NextResponse } from "next/server";
import { fetchStockNews } from "@/lib/newsService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stock = searchParams.get('stock');

  if (!stock) {
    return NextResponse.json(
      { error: "Stock name is required" },
      { status: 400 }
    );
  }

  try {
    const news = await fetchStockNews(stock);
    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
} 