import { NextResponse } from "next/server";
import { getPerson } from "@/lib/data-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  const person = await getPerson(personId);
  
  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }
  
  return NextResponse.json(person);
}
