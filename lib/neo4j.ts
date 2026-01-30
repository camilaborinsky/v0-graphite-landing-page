import neo4j, { type Driver, type Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error(
        "Neo4j environment variables not configured. Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD."
      );
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

export async function runQuery<T>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject() as T);
  } catch (error) {
    console.error("[Neo4j] Query failed:", error);
    console.error("[Neo4j] Cypher:", cypher);
    console.error("[Neo4j] Params:", JSON.stringify(params));
    throw error;
  } finally {
    await session.close();
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const session = getSession();
    await session.run("RETURN 1");
    await session.close();
    return true;
  } catch (error) {
    console.error("[Neo4j] Connection test failed:", error);
    return false;
  }
}
