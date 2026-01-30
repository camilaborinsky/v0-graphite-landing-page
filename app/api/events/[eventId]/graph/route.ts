import { NextResponse } from "next/server";
import { getEventGraph } from "@/lib/data-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const vcId = searchParams.get("vcId") || "vc-1";
  
  const graph = await getEventGraph(eventId, vcId);
  return NextResponse.json(graph);
}
