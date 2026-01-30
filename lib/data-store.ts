"use server";

import { runQuery } from "./neo4j";
import type {
  Event,
  GraphData,
  Person,
  Recommendation,
  PersonWithHistory,
  WorkHistory,
} from "./types";

// Portfolio management - Companies the VC wants to track
export async function setPortfolio(
  userId: string,
  companies: string[]
): Promise<void> {
  // First, remove existing portfolio relationships
  await runQuery(
    `
    MATCH (u:User {id: $userId})-[r:HAS_IN_PORTFOLIO]->(c:Company)
    DELETE r
    `,
    { userId }
  );

  // Ensure user exists
  await runQuery(
    `
    MERGE (u:User {id: $userId})
    RETURN u
    `,
    { userId }
  );

  // Create companies and relationships
  for (const companyName of companies) {
    await runQuery(
      `
      MERGE (c:Company {name: $companyName})
      WITH c
      MATCH (u:User {id: $userId})
      MERGE (u)-[:HAS_IN_PORTFOLIO]->(c)
      `,
      { userId, companyName }
    );
  }
}

export async function getPortfolio(userId: string): Promise<string[]> {
  const result = await runQuery<{ name: string }>(
    `
    MATCH (u:User {id: $userId})-[:HAS_IN_PORTFOLIO]->(c:Company)
    RETURN c.name as name
    `,
    { userId }
  );
  return result.map((r) => r.name);
}

export async function addCompanyToPortfolio(
  userId: string,
  company: string
): Promise<void> {
  await runQuery(
    `
    MERGE (u:User {id: $userId})
    MERGE (c:Company {name: $company})
    MERGE (u)-[:HAS_IN_PORTFOLIO]->(c)
    `,
    { userId, company }
  );
}

// Event management
export async function createEvent(event: Event): Promise<void> {
  await runQuery(
    `
    CREATE (e:Event {
      id: $id,
      name: $name,
      date: $date,
      attendeeCount: $attendeeCount
    })
    `,
    {
      id: event.id,
      name: event.name,
      date: event.date,
      attendeeCount: event.attendeeCount,
    }
  );
}

export async function getEvents(): Promise<Event[]> {
  const result = await runQuery<{
    id: string;
    name: string;
    date: string;
    attendeeCount: number;
  }>(
    `
    MATCH (e:Event)
    OPTIONAL MATCH (p:Person)-[:ATTENDS]->(e)
    WITH e, count(p) as actualCount
    RETURN e.id as id, e.name as name, e.date as date, 
           CASE WHEN actualCount > 0 THEN actualCount ELSE e.attendeeCount END as attendeeCount
    ORDER BY e.date DESC
    `
  );
  return result.map((r) => ({
    id: r.id,
    name: r.name,
    date: r.date,
    attendeeCount: typeof r.attendeeCount === 'object' 
      ? (r.attendeeCount as { low: number }).low 
      : r.attendeeCount,
  }));
}

export async function getEvent(eventId: string): Promise<Event | undefined> {
  const result = await runQuery<{
    id: string;
    name: string;
    date: string;
    attendeeCount: number;
  }>(
    `
    MATCH (e:Event {id: $eventId})
    OPTIONAL MATCH (p:Person)-[:ATTENDS]->(e)
    WITH e, count(p) as actualCount
    RETURN e.id as id, e.name as name, e.date as date,
           CASE WHEN actualCount > 0 THEN actualCount ELSE e.attendeeCount END as attendeeCount
    `,
    { eventId }
  );
  if (result.length === 0) return undefined;
  const r = result[0];
  return {
    id: r.id,
    name: r.name,
    date: r.date,
    attendeeCount: typeof r.attendeeCount === 'object' 
      ? (r.attendeeCount as { low: number }).low 
      : r.attendeeCount,
  };
}

export async function deleteEvent(eventId: string): Promise<void> {
  await runQuery(
    `
    MATCH (e:Event {id: $eventId})
    OPTIONAL MATCH (p:Person)-[r:ATTENDS]->(e)
    DELETE r, e
    `,
    { eventId }
  );
}

// Attendee management
interface AttendeeInput {
  id: string;
  name: string;
  title: string;
  currentCompany: string;
  workHistory?: { company: string; title: string; from: string; to?: string }[];
}

export async function addAttendeesToEvent(
  eventId: string,
  attendees: AttendeeInput[]
): Promise<void> {
  for (const attendee of attendees) {
    // Create person node
    await runQuery(
      `
      MERGE (p:Person {id: $id})
      SET p.name = $name, p.title = $title, p.currentCompany = $currentCompany
      `,
      {
        id: attendee.id,
        name: attendee.name,
        title: attendee.title,
        currentCompany: attendee.currentCompany,
      }
    );

    // Create ATTENDS relationship to event
    await runQuery(
      `
      MATCH (p:Person {id: $personId})
      MATCH (e:Event {id: $eventId})
      MERGE (p)-[:ATTENDS]->(e)
      `,
      { personId: attendee.id, eventId }
    );

    // Create current company and WORKS_AT relationship
    if (attendee.currentCompany) {
      await runQuery(
        `
        MERGE (c:Company {name: $companyName})
        WITH c
        MATCH (p:Person {id: $personId})
        MERGE (p)-[:WORKS_AT]->(c)
        `,
        { personId: attendee.id, companyName: attendee.currentCompany }
      );
    }

    // Create work history relationships
    if (attendee.workHistory) {
      for (const work of attendee.workHistory) {
        if (work.to) {
          // Past job
          await runQuery(
            `
            MERGE (c:Company {name: $companyName})
            WITH c
            MATCH (p:Person {id: $personId})
            MERGE (p)-[r:WORKED_AT]->(c)
            SET r.title = $title, r.from = $from, r.to = $to
            `,
            {
              personId: attendee.id,
              companyName: work.company,
              title: work.title,
              from: work.from,
              to: work.to,
            }
          );
        }
      }
    }
  }

  // Update event attendee count
  await runQuery(
    `
    MATCH (e:Event {id: $eventId})
    OPTIONAL MATCH (p:Person)-[:ATTENDS]->(e)
    WITH e, count(p) as cnt
    SET e.attendeeCount = cnt
    `,
    { eventId }
  );

  // Auto-detect connections: people who worked at the same company
  await runQuery(
    `
    MATCH (p1:Person)-[:ATTENDS]->(e:Event {id: $eventId})
    MATCH (p2:Person)-[:ATTENDS]->(e)
    WHERE p1.id < p2.id
    MATCH (p1)-[:WORKS_AT|WORKED_AT]->(c:Company)<-[:WORKS_AT|WORKED_AT]-(p2)
    MERGE (p1)-[:CONNECTED_TO]-(p2)
    `,
    { eventId }
  );
}

// Connection management
export async function addConnection(
  person1Id: string,
  person2Id: string
): Promise<void> {
  await runQuery(
    `
    MATCH (p1:Person {id: $person1Id})
    MATCH (p2:Person {id: $person2Id})
    MERGE (p1)-[:CONNECTED_TO]-(p2)
    `,
    { person1Id, person2Id }
  );
}

// Graph generation for visualization
export async function getEventGraph(
  eventId: string,
  userId: string
): Promise<GraphData> {
  // Get portfolio companies for this user to mark target companies
  const portfolio = await getPortfolio(userId);
  const portfolioSet = new Set(portfolio);

  // Get ALL nodes and relationships from Neo4j
  const allData = await runQuery<{
    n: { labels: string[]; properties: Record<string, unknown> };
    r: { type: string; startNodeElementId: string; endNodeElementId: string } | null;
    startNode: { labels: string[]; properties: Record<string, unknown> } | null;
    endNode: { labels: string[]; properties: Record<string, unknown> } | null;
  }>(
    `
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, 
           CASE WHEN r IS NOT NULL THEN startNode(r) END as startNode,
           CASE WHEN r IS NOT NULL THEN endNode(r) END as endNode
    `
  );

  const nodes: GraphData["nodes"] = [];
  const links: GraphData["links"] = [];
  const addedNodes = new Set<string>();
  const addedLinks = new Set<string>();

  // Process all nodes
  for (const row of allData) {
    const nodeProps = row.n.properties;
    const labels = row.n.labels || [];
    const nodeId = (nodeProps.id as string) || (nodeProps.name as string) || `node-${addedNodes.size}`;
    
    if (!addedNodes.has(nodeId)) {
      if (labels.includes("Person")) {
        nodes.push({
          id: nodeId,
          name: (nodeProps.name as string) || "Unknown",
          type: "person",
          title: (nodeProps.title as string) || "",
        });
      } else if (labels.includes("Company")) {
        const companyName = (nodeProps.name as string) || "Unknown";
        nodes.push({
          id: `company-${companyName}`,
          name: companyName,
          type: "company",
          isTarget: portfolioSet.has(companyName),
        });
      } else if (labels.includes("Event")) {
        nodes.push({
          id: nodeId,
          name: (nodeProps.name as string) || "Event",
          type: "event" as "person" | "company",
        });
      } else if (labels.includes("User")) {
        nodes.push({
          id: nodeId,
          name: (nodeProps.id as string) || "User",
          type: "user" as "person" | "company",
        });
      }
      addedNodes.add(nodeId);
    }

    // Process relationships
    if (row.r && row.startNode && row.endNode) {
      const startProps = row.startNode.properties;
      const endProps = row.endNode.properties;
      const startLabels = row.startNode.labels || [];
      const endLabels = row.endNode.labels || [];
      
      let sourceId = (startProps.id as string) || (startProps.name as string);
      let targetId = (endProps.id as string) || (endProps.name as string);
      
      // Adjust IDs for companies
      if (startLabels.includes("Company")) {
        sourceId = `company-${startProps.name}`;
      }
      if (endLabels.includes("Company")) {
        targetId = `company-${endProps.name}`;
      }
      
      const relType = row.r.type;
      const linkKey = `${sourceId}-${targetId}-${relType}`;
      
      if (sourceId && targetId && !addedLinks.has(linkKey)) {
        links.push({
          source: sourceId,
          target: targetId,
          type: relType as "WORKS_AT" | "WORKED_AT" | "CONNECTED_TO",
        });
        addedLinks.add(linkKey);
      }
    }
  }

  return { nodes, links };
}

// Recommendations - who to meet at this event
export async function getRecommendations(
  eventId: string,
  userId: string
): Promise<Recommendation[]> {
  const portfolio = await getPortfolio(userId);
  if (portfolio.length === 0) return [];

  const recommendations: Recommendation[] = [];
  const addedPersons = new Set<string>();

  // 1. People who currently work at portfolio companies
  const worksAtResults = await runQuery<{
    personId: string;
    personName: string;
    personTitle: string;
    companyName: string;
  }>(
    `
    MATCH (p:Person)-[:ATTENDS]->(e:Event {id: $eventId})
    MATCH (p)-[:WORKS_AT]->(c:Company)
    WHERE c.name IN $portfolio
    RETURN p.id as personId, p.name as personName, p.title as personTitle, c.name as companyName
    `,
    { eventId, portfolio }
  );

  for (const row of worksAtResults) {
    if (!addedPersons.has(row.personId)) {
      recommendations.push({
        person: {
          id: row.personId,
          name: row.personName,
          title: row.personTitle,
          currentCompany: row.companyName,
        },
        reason: `Works at ${row.companyName}`,
        reasonType: "works_at_target",
        targetCompany: row.companyName,
      });
      addedPersons.add(row.personId);
    }
  }

  // 2. People who formerly worked at portfolio companies
  const workedAtResults = await runQuery<{
    personId: string;
    personName: string;
    personTitle: string;
    currentCompany: string;
    formerCompany: string;
  }>(
    `
    MATCH (p:Person)-[:ATTENDS]->(e:Event {id: $eventId})
    MATCH (p)-[:WORKED_AT]->(c:Company)
    WHERE c.name IN $portfolio
    RETURN p.id as personId, p.name as personName, p.title as personTitle, 
           p.currentCompany as currentCompany, c.name as formerCompany
    `,
    { eventId, portfolio }
  );

  for (const row of workedAtResults) {
    if (!addedPersons.has(row.personId)) {
      recommendations.push({
        person: {
          id: row.personId,
          name: row.personName,
          title: row.personTitle,
          currentCompany: row.currentCompany,
        },
        reason: `Former ${row.formerCompany}`,
        reasonType: "former_target",
        targetCompany: row.formerCompany,
      });
      addedPersons.add(row.personId);
    }
  }

  // 3. People connected to someone at a portfolio company
  const connectedResults = await runQuery<{
    personId: string;
    personName: string;
    personTitle: string;
    currentCompany: string;
    connectedPersonName: string;
    targetCompany: string;
  }>(
    `
    MATCH (p:Person)-[:ATTENDS]->(e:Event {id: $eventId})
    MATCH (p)-[:CONNECTED_TO]-(other:Person)-[:WORKS_AT]->(c:Company)
    WHERE c.name IN $portfolio
    RETURN p.id as personId, p.name as personName, p.title as personTitle,
           p.currentCompany as currentCompany, other.name as connectedPersonName, c.name as targetCompany
    `,
    { eventId, portfolio }
  );

  for (const row of connectedResults) {
    if (!addedPersons.has(row.personId)) {
      recommendations.push({
        person: {
          id: row.personId,
          name: row.personName,
          title: row.personTitle,
          currentCompany: row.currentCompany,
        },
        reason: `Connected to ${row.connectedPersonName} at ${row.targetCompany}`,
        reasonType: "connected_to_target",
        targetCompany: row.targetCompany,
        connectedPerson: row.connectedPersonName,
      });
      addedPersons.add(row.personId);
    }
  }

  return recommendations;
}

// Person details with work history
export async function getPerson(
  personId: string
): Promise<PersonWithHistory | null> {
  // Get person basic info
  const personResult = await runQuery<{
    id: string;
    name: string;
    title: string;
    currentCompany: string;
  }>(
    `
    MATCH (p:Person {id: $personId})
    RETURN p.id as id, p.name as name, p.title as title, p.currentCompany as currentCompany
    `,
    { personId }
  );

  if (personResult.length === 0) return null;
  const person = personResult[0];

  // Get work history
  const workHistoryResult = await runQuery<{
    company: string;
    title: string;
    from: string;
    to: string | null;
    isCurrent: boolean;
  }>(
    `
    MATCH (p:Person {id: $personId})-[r:WORKS_AT|WORKED_AT]->(c:Company)
    RETURN c.name as company, 
           COALESCE(r.title, p.title) as title,
           COALESCE(r.from, '2020') as from,
           r.to as to,
           type(r) = 'WORKS_AT' as isCurrent
    ORDER BY isCurrent DESC, r.from DESC
    `,
    { personId }
  );

  const workHistory: WorkHistory[] = workHistoryResult.map((w) => ({
    company: w.company,
    title: w.title,
    from: w.from,
    to: w.to || undefined,
    isCurrent: w.isCurrent,
  }));

  // Get connections
  const connectionsResult = await runQuery<{
    id: string;
    name: string;
    title: string;
    currentCompany: string;
  }>(
    `
    MATCH (p:Person {id: $personId})-[:CONNECTED_TO]-(other:Person)
    RETURN other.id as id, other.name as name, other.title as title, other.currentCompany as currentCompany
    `,
    { personId }
  );

  const connections: Person[] = connectionsResult.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    currentCompany: c.currentCompany,
  }));

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

// Check if user has any data
export async function hasUserData(userId: string): Promise<boolean> {
  const portfolioResult = await runQuery<{ count: number }>(
    `
    MATCH (u:User {id: $userId})-[:HAS_IN_PORTFOLIO]->(c:Company)
    RETURN count(c) as count
    `,
    { userId }
  );

  const eventsResult = await runQuery<{ count: number }>(
    `
    MATCH (e:Event)
    RETURN count(e) as count
    `
  );

  const portfolioCount = portfolioResult[0]?.count || 0;
  const eventsCount = eventsResult[0]?.count || 0;

  const pCount = typeof portfolioCount === 'object' 
    ? (portfolioCount as unknown as { low: number }).low 
    : portfolioCount;
  const eCount = typeof eventsCount === 'object' 
    ? (eventsCount as unknown as { low: number }).low 
    : eventsCount;

  return pCount > 0 || eCount > 0;
}
