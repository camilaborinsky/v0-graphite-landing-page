"use server";

import type { Event, GraphData, Person, Recommendation, PersonWithHistory, WorkHistory } from "./types";

// In-memory store (persists during server runtime)
// In production, this would be replaced with Neo4j queries

interface StoredPerson extends Person {
  workHistory: { company: string; title: string; from: string; to?: string }[];
}

interface DataStore {
  portfolios: Map<string, string[]>;
  events: Map<string, Event>;
  eventAttendees: Map<string, string[]>;
  people: Map<string, StoredPerson>;
  connections: [string, string][];
}

// Global store
const store: DataStore = {
  portfolios: new Map(),
  events: new Map(),
  eventAttendees: new Map(),
  people: new Map(),
  connections: [],
};

// Portfolio management
export async function setPortfolio(userId: string, companies: string[]): Promise<void> {
  store.portfolios.set(userId, companies);
}

export async function getPortfolio(userId: string): Promise<string[]> {
  return store.portfolios.get(userId) || [];
}

export async function addCompanyToPortfolio(userId: string, company: string): Promise<void> {
  const portfolio = store.portfolios.get(userId) || [];
  if (!portfolio.includes(company)) {
    portfolio.push(company);
    store.portfolios.set(userId, portfolio);
  }
}

// Event management
export async function createEvent(event: Event): Promise<void> {
  store.events.set(event.id, event);
  store.eventAttendees.set(event.id, []);
}

export async function getEvents(): Promise<Event[]> {
  return Array.from(store.events.values());
}

export async function getEvent(eventId: string): Promise<Event | undefined> {
  return store.events.get(eventId);
}

export async function deleteEvent(eventId: string): Promise<void> {
  store.events.delete(eventId);
  store.eventAttendees.delete(eventId);
}

// Attendee management
export async function addAttendeesToEvent(eventId: string, attendees: StoredPerson[]): Promise<void> {
  const attendeeIds: string[] = [];
  
  for (const attendee of attendees) {
    store.people.set(attendee.id, attendee);
    attendeeIds.push(attendee.id);
  }
  
  const existing = store.eventAttendees.get(eventId) || [];
  store.eventAttendees.set(eventId, [...existing, ...attendeeIds]);
  
  // Update event attendee count
  const event = store.events.get(eventId);
  if (event) {
    event.attendeeCount = (store.eventAttendees.get(eventId) || []).length;
    store.events.set(eventId, event);
  }
}

// Connection management
export async function addConnection(person1Id: string, person2Id: string): Promise<void> {
  const exists = store.connections.some(
    ([p1, p2]) => (p1 === person1Id && p2 === person2Id) || (p1 === person2Id && p2 === person1Id)
  );
  if (!exists) {
    store.connections.push([person1Id, person2Id]);
  }
}

// Graph generation
export async function getEventGraph(eventId: string, userId: string): Promise<GraphData> {
  const attendeeIds = store.eventAttendees.get(eventId) || [];
  const attendees = attendeeIds
    .map((id) => store.people.get(id))
    .filter((p): p is StoredPerson => p !== undefined);
  const portfolio = await getPortfolio(userId);
  
  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];
  const companySet = new Set<string>();
  
  // Add person nodes and collect companies
  for (const person of attendees) {
    nodes.push({
      id: person.id,
      name: person.name,
      type: "person",
      title: person.title,
      photoUrl: person.photoUrl,
    });
    
    // Current company
    if (person.currentCompany) {
      companySet.add(person.currentCompany);
      links.push({
        source: person.id,
        target: `company-${person.currentCompany}`,
        type: "WORKS_AT",
      });
    }
    
    // Past companies
    for (const work of person.workHistory || []) {
      if (work.to) {
        companySet.add(work.company);
        links.push({
          source: person.id,
          target: `company-${work.company}`,
          type: "WORKED_AT",
        });
      }
    }
  }
  
  // Add company nodes
  for (const company of companySet) {
    nodes.push({
      id: `company-${company}`,
      name: company,
      type: "company",
      isTarget: portfolio.includes(company),
    });
  }
  
  // Add person-to-person connections
  for (const [p1, p2] of store.connections) {
    if (attendeeIds.includes(p1) && attendeeIds.includes(p2)) {
      links.push({
        source: p1,
        target: p2,
        type: "CONNECTED_TO",
      });
    }
  }
  
  return { nodes, links };
}

// Recommendations
export async function getRecommendations(eventId: string, userId: string): Promise<Recommendation[]> {
  const attendeeIds = store.eventAttendees.get(eventId) || [];
  const attendees = attendeeIds
    .map((id) => store.people.get(id))
    .filter((p): p is StoredPerson => p !== undefined);
  const portfolio = await getPortfolio(userId);
  const recommendations: Recommendation[] = [];
  
  for (const person of attendees) {
    // Check if currently works at target
    if (portfolio.includes(person.currentCompany)) {
      recommendations.push({
        person: { id: person.id, name: person.name, title: person.title, currentCompany: person.currentCompany },
        reason: `Works at ${person.currentCompany}`,
        reasonType: "works_at_target",
        targetCompany: person.currentCompany,
      });
      continue;
    }
    
    // Check if formerly worked at target
    const formerTarget = (person.workHistory || []).find((w) => w.to && portfolio.includes(w.company));
    if (formerTarget) {
      recommendations.push({
        person: { id: person.id, name: person.name, title: person.title, currentCompany: person.currentCompany },
        reason: `Former ${formerTarget.company}`,
        reasonType: "former_target",
        targetCompany: formerTarget.company,
      });
      continue;
    }
    
    // Check if connected to someone at target
    for (const [p1, p2] of store.connections) {
      const connectedId = p1 === person.id ? p2 : p2 === person.id ? p1 : null;
      if (connectedId && attendeeIds.includes(connectedId)) {
        const connectedPerson = store.people.get(connectedId);
        if (connectedPerson && portfolio.includes(connectedPerson.currentCompany)) {
          recommendations.push({
            person: { id: person.id, name: person.name, title: person.title, currentCompany: person.currentCompany },
            reason: `Connected to ${connectedPerson.name} at ${connectedPerson.currentCompany}`,
            reasonType: "connected_to_target",
            targetCompany: connectedPerson.currentCompany,
            connectedPerson: connectedPerson.name,
          });
          break;
        }
      }
    }
  }
  
  // Sort: works_at_target first, then former_target, then connected
  const order = { works_at_target: 0, former_target: 1, connected_to_target: 2 };
  return recommendations.sort((a, b) => order[a.reasonType] - order[b.reasonType]);
}

// Person details
export async function getPerson(personId: string): Promise<PersonWithHistory | null> {
  const person = store.people.get(personId);
  if (!person) return null;
  
  const workHistory: WorkHistory[] = (person.workHistory || []).map((w) => ({
    company: w.company,
    title: w.title,
    from: w.from,
    to: w.to,
    isCurrent: !w.to,
  }));
  
  const connectionIds = store.connections
    .filter(([p1, p2]) => p1 === personId || p2 === personId)
    .map(([p1, p2]) => (p1 === personId ? p2 : p1));
  
  const connections = connectionIds
    .map((id) => store.people.get(id))
    .filter((p): p is StoredPerson => p !== undefined)
    .map((p) => ({ id: p.id, name: p.name, title: p.title, currentCompany: p.currentCompany }));
  
  return {
    id: person.id,
    name: person.name,
    title: person.title,
    currentCompany: person.currentCompany,
    linkedinUrl: `https://linkedin.com/in/${person.name.toLowerCase().replace(" ", "-")}`,
    workHistory,
    connections,
  };
}

// Check if user has data
export async function hasUserData(userId: string): Promise<boolean> {
  const portfolio = store.portfolios.get(userId);
  const events = Array.from(store.events.values());
  return (portfolio && portfolio.length > 0) || events.length > 0;
}
