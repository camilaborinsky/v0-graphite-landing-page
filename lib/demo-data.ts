import type { Event, GraphData, Person, Recommendation, PersonWithHistory, WorkHistory } from "./types";

// Portfolio companies per VC
export const VC_PORTFOLIOS: Record<string, string[]> = {
  "vc-1": ["Stripe", "Figma", "Notion", "Linear", "Vercel"],
  "vc-2": ["OpenAI", "Anthropic", "Mistral", "Cohere", "Databricks"],
  "vc-3": ["SpaceX", "Anduril", "Palantir", "Scale AI", "Flexport"],
};

export const DEMO_EVENTS: Event[] = [
  { id: "event-1", name: "GitHub Galaxy Hackathon", date: "Jan 30, 2026", attendeeCount: 150 },
  { id: "event-2", name: "SF Founders Meetup", date: "Feb 5, 2026", attendeeCount: 80 },
  { id: "event-3", name: "YC Demo Day", date: "Feb 12, 2026", attendeeCount: 200 },
];

// Demo people with their work histories
const DEMO_PEOPLE: (Person & { workHistory: { company: string; title: string; from: string; to?: string }[] })[] = [
  // People connected to VC-1 targets (Stripe, Figma, Notion, Linear, Vercel)
  { id: "p-1", name: "Alex Rivera", title: "Senior Engineer", currentCompany: "Stripe", workHistory: [{ company: "Stripe", title: "Senior Engineer", from: "2022" }, { company: "Google", title: "Engineer", from: "2019", to: "2022" }] },
  { id: "p-2", name: "Jordan Lee", title: "Product Manager", currentCompany: "Figma", workHistory: [{ company: "Figma", title: "Product Manager", from: "2021" }, { company: "Notion", title: "APM", from: "2019", to: "2021" }] },
  { id: "p-3", name: "Casey Morgan", title: "Designer", currentCompany: "Linear", workHistory: [{ company: "Linear", title: "Designer", from: "2023" }, { company: "Figma", title: "Designer", from: "2020", to: "2023" }] },
  { id: "p-4", name: "Taylor Kim", title: "Engineering Lead", currentCompany: "Vercel", workHistory: [{ company: "Vercel", title: "Engineering Lead", from: "2021" }, { company: "Stripe", title: "Engineer", from: "2018", to: "2021" }] },
  { id: "p-5", name: "Morgan Chen", title: "Operations", currentCompany: "Notion", workHistory: [{ company: "Notion", title: "Operations", from: "2022" }] },
  
  // People connected to VC-2 targets (OpenAI, Anthropic, Mistral, Cohere, Databricks)
  { id: "p-6", name: "Sam Patel", title: "Research Scientist", currentCompany: "OpenAI", workHistory: [{ company: "OpenAI", title: "Research Scientist", from: "2021" }, { company: "DeepMind", title: "Researcher", from: "2018", to: "2021" }] },
  { id: "p-7", name: "Jamie Wu", title: "ML Engineer", currentCompany: "Anthropic", workHistory: [{ company: "Anthropic", title: "ML Engineer", from: "2022" }, { company: "OpenAI", title: "Engineer", from: "2019", to: "2022" }] },
  { id: "p-8", name: "Riley Thompson", title: "Product Lead", currentCompany: "Cohere", workHistory: [{ company: "Cohere", title: "Product Lead", from: "2023" }, { company: "Google AI", title: "PM", from: "2020", to: "2023" }] },
  { id: "p-9", name: "Quinn Davis", title: "Data Scientist", currentCompany: "Databricks", workHistory: [{ company: "Databricks", title: "Data Scientist", from: "2021" }, { company: "Anthropic", title: "Analyst", from: "2019", to: "2021" }] },
  { id: "p-10", name: "Avery Scott", title: "Engineer", currentCompany: "Mistral", workHistory: [{ company: "Mistral", title: "Engineer", from: "2023" }] },
  
  // People connected to VC-3 targets (SpaceX, Anduril, Palantir, Scale AI, Flexport)
  { id: "p-11", name: "Blake Johnson", title: "Systems Engineer", currentCompany: "SpaceX", workHistory: [{ company: "SpaceX", title: "Systems Engineer", from: "2020" }, { company: "NASA", title: "Engineer", from: "2016", to: "2020" }] },
  { id: "p-12", name: "Drew Martinez", title: "Defense Tech Lead", currentCompany: "Anduril", workHistory: [{ company: "Anduril", title: "Defense Tech Lead", from: "2021" }, { company: "Palantir", title: "Engineer", from: "2018", to: "2021" }] },
  { id: "p-13", name: "Cameron White", title: "Data Engineer", currentCompany: "Palantir", workHistory: [{ company: "Palantir", title: "Data Engineer", from: "2019" }] },
  { id: "p-14", name: "Skyler Brown", title: "ML Lead", currentCompany: "Scale AI", workHistory: [{ company: "Scale AI", title: "ML Lead", from: "2022" }, { company: "SpaceX", title: "ML Engineer", from: "2019", to: "2022" }] },
  { id: "p-15", name: "Hayden Garcia", title: "Logistics PM", currentCompany: "Flexport", workHistory: [{ company: "Flexport", title: "Logistics PM", from: "2021" }, { company: "Amazon", title: "PM", from: "2018", to: "2021" }] },
  
  // Additional people for graph density
  { id: "p-16", name: "Phoenix Adams", title: "Founder", currentCompany: "Stealth Startup", workHistory: [{ company: "Stealth Startup", title: "Founder", from: "2024" }, { company: "Stripe", title: "Staff Engineer", from: "2019", to: "2024" }] },
  { id: "p-17", name: "River Zhang", title: "VC Associate", currentCompany: "Greylock", workHistory: [{ company: "Greylock", title: "VC Associate", from: "2023" }, { company: "Linear", title: "Engineer", from: "2020", to: "2023" }] },
  { id: "p-18", name: "Sage Williams", title: "CTO", currentCompany: "Series A Startup", workHistory: [{ company: "Series A Startup", title: "CTO", from: "2023" }, { company: "Vercel", title: "Engineer", from: "2020", to: "2023" }] },
  { id: "p-19", name: "Dakota Lee", title: "AI Researcher", currentCompany: "Stanford", workHistory: [{ company: "Stanford", title: "AI Researcher", from: "2022" }, { company: "OpenAI", title: "Intern", from: "2021", to: "2022" }] },
  { id: "p-20", name: "Emerson Clark", title: "Growth Lead", currentCompany: "Notion", workHistory: [{ company: "Notion", title: "Growth Lead", from: "2021" }, { company: "Figma", title: "Marketing", from: "2018", to: "2021" }] },
];

// Event attendees mapping
const EVENT_ATTENDEES: Record<string, string[]> = {
  "event-1": ["p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-7", "p-11", "p-12", "p-16", "p-17", "p-18", "p-19", "p-20"],
  "event-2": ["p-2", "p-5", "p-6", "p-8", "p-9", "p-10", "p-13", "p-14", "p-15", "p-17", "p-19"],
  "event-3": ["p-1", "p-3", "p-4", "p-6", "p-7", "p-8", "p-10", "p-11", "p-12", "p-13", "p-14", "p-15", "p-16", "p-18", "p-20"],
};

// Person connections (know each other)
const PERSON_CONNECTIONS: [string, string][] = [
  ["p-1", "p-4"], // Both worked at Stripe
  ["p-2", "p-3"], // Both worked at Figma
  ["p-2", "p-20"], // Both at Figma/Notion
  ["p-6", "p-7"], // Both at OpenAI
  ["p-6", "p-19"], // OpenAI connection
  ["p-9", "p-7"], // Anthropic connection
  ["p-11", "p-14"], // SpaceX connection
  ["p-12", "p-13"], // Palantir connection
  ["p-16", "p-1"], // Former Stripe colleagues
  ["p-17", "p-3"], // Linear connection
  ["p-18", "p-4"], // Vercel connection
];

// Helper functions
export function getEvents(): Event[] {
  return DEMO_EVENTS;
}

export function getEvent(eventId: string): Event | undefined {
  return DEMO_EVENTS.find((e) => e.id === eventId);
}

export function getPortfolio(vcId: string): string[] {
  return VC_PORTFOLIOS[vcId] || [];
}

export function getEventGraph(eventId: string, vcId: string): GraphData {
  const attendeeIds = EVENT_ATTENDEES[eventId] || [];
  const attendees = DEMO_PEOPLE.filter((p) => attendeeIds.includes(p.id));
  const portfolio = getPortfolio(vcId);
  
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
    companySet.add(person.currentCompany);
    links.push({
      source: person.id,
      target: `company-${person.currentCompany}`,
      type: "WORKS_AT",
    });
    
    // Past companies
    for (const work of person.workHistory) {
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
  for (const [p1, p2] of PERSON_CONNECTIONS) {
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

export function getRecommendations(eventId: string, vcId: string): Recommendation[] {
  const attendeeIds = EVENT_ATTENDEES[eventId] || [];
  const attendees = DEMO_PEOPLE.filter((p) => attendeeIds.includes(p.id));
  const portfolio = getPortfolio(vcId);
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
    const formerTarget = person.workHistory.find((w) => w.to && portfolio.includes(w.company));
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
    for (const [p1, p2] of PERSON_CONNECTIONS) {
      const connectedId = p1 === person.id ? p2 : p2 === person.id ? p1 : null;
      if (connectedId && attendeeIds.includes(connectedId)) {
        const connectedPerson = DEMO_PEOPLE.find((p) => p.id === connectedId);
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

export function getPerson(personId: string): PersonWithHistory | null {
  const person = DEMO_PEOPLE.find((p) => p.id === personId);
  if (!person) return null;
  
  const workHistory: WorkHistory[] = person.workHistory.map((w) => ({
    company: w.company,
    title: w.title,
    from: w.from,
    to: w.to,
    isCurrent: !w.to,
  }));
  
  const connectionIds = PERSON_CONNECTIONS
    .filter(([p1, p2]) => p1 === personId || p2 === personId)
    .map(([p1, p2]) => (p1 === personId ? p2 : p1));
  
  const connections = DEMO_PEOPLE
    .filter((p) => connectionIds.includes(p.id))
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
