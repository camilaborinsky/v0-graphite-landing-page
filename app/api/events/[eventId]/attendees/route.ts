import { NextResponse } from "next/server";
import { addAttendeesToEvent, addConnection } from "@/lib/data-store";
import { nanoid } from "nanoid";

interface AttendeeCSVRow {
  name: string;
  title?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  workHistory?: string; // JSON string or comma-separated "Company:Title:From:To"
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { attendees } = await request.json() as { attendees: AttendeeCSVRow[] };
    
    if (!attendees || !Array.isArray(attendees)) {
      return NextResponse.json({ error: "Invalid attendees data" }, { status: 400 });
    }
    
    const processedAttendees = attendees.map((a) => {
      // Parse work history if provided
      let workHistory: { company: string; title: string; from: string; to?: string }[] = [];
      
      if (a.workHistory) {
        try {
          // Try JSON parse first
          workHistory = JSON.parse(a.workHistory);
        } catch {
          // Try comma-separated format: "Company:Title:From:To,Company:Title:From"
          workHistory = a.workHistory.split(",").map((entry) => {
            const [company, title, from, to] = entry.split(":").map((s) => s.trim());
            return { company, title: title || "", from: from || "2020", to: to || undefined };
          }).filter((w) => w.company);
        }
      }
      
      // If no work history but has current company, create one
      if (workHistory.length === 0 && a.currentCompany) {
        workHistory = [{ company: a.currentCompany, title: a.title || "", from: "2020" }];
      }
      
      return {
        id: `person-${nanoid(8)}`,
        name: a.name,
        title: a.title || "",
        currentCompany: a.currentCompany || "",
        linkedinUrl: a.linkedinUrl,
        workHistory,
      };
    });
    
    await addAttendeesToEvent(eventId, processedAttendees);
    
    // Auto-detect connections based on shared companies
    const companyPeople = new Map<string, string[]>();
    for (const person of processedAttendees) {
      for (const work of person.workHistory) {
        const people = companyPeople.get(work.company) || [];
        people.push(person.id);
        companyPeople.set(work.company, people);
      }
    }
    
    // Create connections for people who worked at the same company
    for (const people of companyPeople.values()) {
      if (people.length > 1) {
        for (let i = 0; i < people.length - 1; i++) {
          for (let j = i + 1; j < people.length; j++) {
            await addConnection(people[i], people[j]);
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, count: processedAttendees.length });
  } catch {
    return NextResponse.json({ error: "Failed to add attendees" }, { status: 500 });
  }
}
