import { NextResponse } from "next/server";
import { testConnection } from "@/lib/neo4j";

export async function GET() {
  try {
    const neo4jConnected = await testConnection();
    
    return NextResponse.json({
      status: neo4jConnected ? "healthy" : "degraded",
      neo4j: neo4jConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      neo4j: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
