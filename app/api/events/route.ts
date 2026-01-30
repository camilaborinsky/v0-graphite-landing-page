import { NextResponse } from "next/server";
import { getEvents } from "@/lib/demo-data";

export async function GET() {
  const events = getEvents();
  return NextResponse.json(events);
}
