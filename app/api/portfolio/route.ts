import { NextResponse } from "next/server";
import { getPortfolio, setPortfolio } from "@/lib/data-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  
  const portfolio = await getPortfolio(userId);
  return NextResponse.json(portfolio);
}

export async function POST(request: Request) {
  try {
    const { userId, companies } = await request.json();
    
    if (!userId || !companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    await setPortfolio(userId, companies);
    return NextResponse.json({ success: true, count: companies.length });
  } catch {
    return NextResponse.json({ error: "Failed to upload portfolio" }, { status: 500 });
  }
}
