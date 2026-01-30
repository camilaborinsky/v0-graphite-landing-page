/**
 * Neo4j Database Seed Script for Graphite
 * 
 * Run with: npx tsx scripts/seed-neo4j.ts
 * 
 * Requires environment variables:
 * - NEO4J_URI
 * - NEO4J_USER
 * - NEO4J_PASSWORD
 */

import neo4j from "neo4j-driver";

const uri = process.env.NEO4J_URI!;
const user = process.env.NEO4J_USER!;
const password = process.env.NEO4J_PASSWORD!;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function seed() {
  const session = driver.session();

  try {
    console.log("Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating VCs (judges)...");
    await session.run(`
      CREATE (vc1:VC {id: 'vc-1', name: 'Sarah Chen', firm: 'Sequoia Capital'})
      CREATE (vc2:VC {id: 'vc-2', name: 'Marcus Johnson', firm: 'a16z'})
      CREATE (vc3:VC {id: 'vc-3', name: 'Elena Rodriguez', firm: 'Founders Fund'})
    `);

    console.log("Creating companies...");
    await session.run(`
      // VC-1 Portfolio (Sequoia)
      CREATE (stripe:Company {id: 'c-stripe', name: 'Stripe', industry: 'Fintech', isTarget: true})
      CREATE (figma:Company {id: 'c-figma', name: 'Figma', industry: 'Design', isTarget: true})
      CREATE (notion:Company {id: 'c-notion', name: 'Notion', industry: 'Productivity', isTarget: true})
      CREATE (linear:Company {id: 'c-linear', name: 'Linear', industry: 'Productivity', isTarget: true})
      CREATE (vercel:Company {id: 'c-vercel', name: 'Vercel', industry: 'Developer Tools', isTarget: true})
      
      // VC-2 Portfolio (a16z)
      CREATE (openai:Company {id: 'c-openai', name: 'OpenAI', industry: 'AI', isTarget: true})
      CREATE (anthropic:Company {id: 'c-anthropic', name: 'Anthropic', industry: 'AI', isTarget: true})
      CREATE (mistral:Company {id: 'c-mistral', name: 'Mistral', industry: 'AI', isTarget: true})
      CREATE (cohere:Company {id: 'c-cohere', name: 'Cohere', industry: 'AI', isTarget: true})
      CREATE (databricks:Company {id: 'c-databricks', name: 'Databricks', industry: 'Data', isTarget: true})
      
      // VC-3 Portfolio (Founders Fund)
      CREATE (spacex:Company {id: 'c-spacex', name: 'SpaceX', industry: 'Aerospace', isTarget: true})
      CREATE (anduril:Company {id: 'c-anduril', name: 'Anduril', industry: 'Defense', isTarget: true})
      CREATE (palantir:Company {id: 'c-palantir', name: 'Palantir', industry: 'Data', isTarget: true})
      CREATE (scaleai:Company {id: 'c-scaleai', name: 'Scale AI', industry: 'AI', isTarget: true})
      CREATE (flexport:Company {id: 'c-flexport', name: 'Flexport', industry: 'Logistics', isTarget: true})
      
      // Other companies
      CREATE (google:Company {id: 'c-google', name: 'Google', industry: 'Tech'})
      CREATE (deepmind:Company {id: 'c-deepmind', name: 'DeepMind', industry: 'AI'})
      CREATE (googleai:Company {id: 'c-googleai', name: 'Google AI', industry: 'AI'})
      CREATE (nasa:Company {id: 'c-nasa', name: 'NASA', industry: 'Aerospace'})
      CREATE (amazon:Company {id: 'c-amazon', name: 'Amazon', industry: 'Tech'})
      CREATE (greylock:Company {id: 'c-greylock', name: 'Greylock', industry: 'VC'})
      CREATE (stanford:Company {id: 'c-stanford', name: 'Stanford', industry: 'Education'})
      CREATE (stealth:Company {id: 'c-stealth', name: 'Stealth Startup', industry: 'Tech'})
      CREATE (seriesa:Company {id: 'c-seriesa', name: 'Series A Startup', industry: 'Tech'})
    `);

    console.log("Creating VC-Company relationships...");
    await session.run(`
      MATCH (vc1:VC {id: 'vc-1'})
      MATCH (stripe:Company {name: 'Stripe'})
      MATCH (figma:Company {name: 'Figma'})
      MATCH (notion:Company {name: 'Notion'})
      MATCH (linear:Company {name: 'Linear'})
      MATCH (vercel:Company {name: 'Vercel'})
      CREATE (vc1)-[:INTERESTED_IN]->(stripe)
      CREATE (vc1)-[:INTERESTED_IN]->(figma)
      CREATE (vc1)-[:INTERESTED_IN]->(notion)
      CREATE (vc1)-[:INTERESTED_IN]->(linear)
      CREATE (vc1)-[:INTERESTED_IN]->(vercel)
    `);

    await session.run(`
      MATCH (vc2:VC {id: 'vc-2'})
      MATCH (openai:Company {name: 'OpenAI'})
      MATCH (anthropic:Company {name: 'Anthropic'})
      MATCH (mistral:Company {name: 'Mistral'})
      MATCH (cohere:Company {name: 'Cohere'})
      MATCH (databricks:Company {name: 'Databricks'})
      CREATE (vc2)-[:INTERESTED_IN]->(openai)
      CREATE (vc2)-[:INTERESTED_IN]->(anthropic)
      CREATE (vc2)-[:INTERESTED_IN]->(mistral)
      CREATE (vc2)-[:INTERESTED_IN]->(cohere)
      CREATE (vc2)-[:INTERESTED_IN]->(databricks)
    `);

    await session.run(`
      MATCH (vc3:VC {id: 'vc-3'})
      MATCH (spacex:Company {name: 'SpaceX'})
      MATCH (anduril:Company {name: 'Anduril'})
      MATCH (palantir:Company {name: 'Palantir'})
      MATCH (scaleai:Company {name: 'Scale AI'})
      MATCH (flexport:Company {name: 'Flexport'})
      CREATE (vc3)-[:INTERESTED_IN]->(spacex)
      CREATE (vc3)-[:INTERESTED_IN]->(anduril)
      CREATE (vc3)-[:INTERESTED_IN]->(palantir)
      CREATE (vc3)-[:INTERESTED_IN]->(scaleai)
      CREATE (vc3)-[:INTERESTED_IN]->(flexport)
    `);

    console.log("Creating events...");
    await session.run(`
      CREATE (e1:Event {id: 'event-1', name: 'GitHub Galaxy Hackathon', date: '2026-01-30', attendeeCount: 150})
      CREATE (e2:Event {id: 'event-2', name: 'SF Founders Meetup', date: '2026-02-05', attendeeCount: 80})
      CREATE (e3:Event {id: 'event-3', name: 'YC Demo Day', date: '2026-02-12', attendeeCount: 200})
    `);

    console.log("Creating people with work histories...");
    const people = [
      { id: "p-1", name: "Alex Rivera", title: "Senior Engineer", current: "Stripe", past: [{ company: "Google", from: "2019", to: "2022" }] },
      { id: "p-2", name: "Jordan Lee", title: "Product Manager", current: "Figma", past: [{ company: "Notion", from: "2019", to: "2021" }] },
      { id: "p-3", name: "Casey Morgan", title: "Designer", current: "Linear", past: [{ company: "Figma", from: "2020", to: "2023" }] },
      { id: "p-4", name: "Taylor Kim", title: "Engineering Lead", current: "Vercel", past: [{ company: "Stripe", from: "2018", to: "2021" }] },
      { id: "p-5", name: "Morgan Chen", title: "Operations", current: "Notion", past: [] },
      { id: "p-6", name: "Sam Patel", title: "Research Scientist", current: "OpenAI", past: [{ company: "DeepMind", from: "2018", to: "2021" }] },
      { id: "p-7", name: "Jamie Wu", title: "ML Engineer", current: "Anthropic", past: [{ company: "OpenAI", from: "2019", to: "2022" }] },
      { id: "p-8", name: "Riley Thompson", title: "Product Lead", current: "Cohere", past: [{ company: "Google AI", from: "2020", to: "2023" }] },
      { id: "p-9", name: "Quinn Davis", title: "Data Scientist", current: "Databricks", past: [{ company: "Anthropic", from: "2019", to: "2021" }] },
      { id: "p-10", name: "Avery Scott", title: "Engineer", current: "Mistral", past: [] },
      { id: "p-11", name: "Blake Johnson", title: "Systems Engineer", current: "SpaceX", past: [{ company: "NASA", from: "2016", to: "2020" }] },
      { id: "p-12", name: "Drew Martinez", title: "Defense Tech Lead", current: "Anduril", past: [{ company: "Palantir", from: "2018", to: "2021" }] },
      { id: "p-13", name: "Cameron White", title: "Data Engineer", current: "Palantir", past: [] },
      { id: "p-14", name: "Skyler Brown", title: "ML Lead", current: "Scale AI", past: [{ company: "SpaceX", from: "2019", to: "2022" }] },
      { id: "p-15", name: "Hayden Garcia", title: "Logistics PM", current: "Flexport", past: [{ company: "Amazon", from: "2018", to: "2021" }] },
      { id: "p-16", name: "Phoenix Adams", title: "Founder", current: "Stealth Startup", past: [{ company: "Stripe", from: "2019", to: "2024" }] },
      { id: "p-17", name: "River Zhang", title: "VC Associate", current: "Greylock", past: [{ company: "Linear", from: "2020", to: "2023" }] },
      { id: "p-18", name: "Sage Williams", title: "CTO", current: "Series A Startup", past: [{ company: "Vercel", from: "2020", to: "2023" }] },
      { id: "p-19", name: "Dakota Lee", title: "AI Researcher", current: "Stanford", past: [{ company: "OpenAI", from: "2021", to: "2022" }] },
      { id: "p-20", name: "Emerson Clark", title: "Growth Lead", current: "Notion", past: [{ company: "Figma", from: "2018", to: "2021" }] },
    ];

    for (const person of people) {
      await session.run(
        `CREATE (p:Person {id: $id, name: $name, title: $title, currentCompany: $current})`,
        { id: person.id, name: person.name, title: person.title, current: person.current }
      );

      // Current company relationship
      await session.run(
        `MATCH (p:Person {id: $personId}), (c:Company {name: $company})
         CREATE (p)-[:WORKS_AT {since: '2022'}]->(c)`,
        { personId: person.id, company: person.current }
      );

      // Past company relationships
      for (const past of person.past) {
        await session.run(
          `MATCH (p:Person {id: $personId}), (c:Company {name: $company})
           CREATE (p)-[:WORKED_AT {from: $from, to: $to}]->(c)`,
          { personId: person.id, company: past.company, from: past.from, to: past.to }
        );
      }
    }

    console.log("Creating event attendance...");
    const event1Attendees = ["p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-7", "p-11", "p-12", "p-16", "p-17", "p-18", "p-19", "p-20"];
    const event2Attendees = ["p-2", "p-5", "p-6", "p-8", "p-9", "p-10", "p-13", "p-14", "p-15", "p-17", "p-19"];
    const event3Attendees = ["p-1", "p-3", "p-4", "p-6", "p-7", "p-8", "p-10", "p-11", "p-12", "p-13", "p-14", "p-15", "p-16", "p-18", "p-20"];

    for (const pid of event1Attendees) {
      await session.run(
        `MATCH (p:Person {id: $personId}), (e:Event {id: 'event-1'})
         CREATE (p)-[:ATTENDING]->(e)`,
        { personId: pid }
      );
    }

    for (const pid of event2Attendees) {
      await session.run(
        `MATCH (p:Person {id: $personId}), (e:Event {id: 'event-2'})
         CREATE (p)-[:ATTENDING]->(e)`,
        { personId: pid }
      );
    }

    for (const pid of event3Attendees) {
      await session.run(
        `MATCH (p:Person {id: $personId}), (e:Event {id: 'event-3'})
         CREATE (p)-[:ATTENDING]->(e)`,
        { personId: pid }
      );
    }

    console.log("Creating person connections...");
    const connections = [
      ["p-1", "p-4"],   // Both worked at Stripe
      ["p-2", "p-3"],   // Both worked at Figma
      ["p-2", "p-20"],  // Both at Figma/Notion
      ["p-6", "p-7"],   // Both at OpenAI
      ["p-6", "p-19"],  // OpenAI connection
      ["p-9", "p-7"],   // Anthropic connection
      ["p-11", "p-14"], // SpaceX connection
      ["p-12", "p-13"], // Palantir connection
      ["p-16", "p-1"],  // Former Stripe colleagues
      ["p-17", "p-3"],  // Linear connection
      ["p-18", "p-4"],  // Vercel connection
    ];

    for (const [p1, p2] of connections) {
      await session.run(
        `MATCH (a:Person {id: $p1}), (b:Person {id: $p2})
         CREATE (a)-[:CONNECTED_TO]->(b)
         CREATE (b)-[:CONNECTED_TO]->(a)`,
        { p1, p2 }
      );
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
