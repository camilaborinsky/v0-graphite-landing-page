import { NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/data-store";
import { nanoid } from "nanoid";

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const { name, date } = await request.json();
    
    if (!name || !date) {
      return NextResponse.json({ error: "Missing name or date" }, { status: 400 });
    }
    
    const event = {
      id: `event-${nanoid(8)}`,
      name,
      date,
      attendeeCount: 0,
    };
    
    await createEvent(event);
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
