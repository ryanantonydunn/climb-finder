import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import pg, { PoolClient, Pool } from "pg";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
  return parseInt(value);
});

/**
 * Get local database
 */

let dbLocal: Database<sqlite3.Database, sqlite3.Statement> | undefined;

export async function dbLoadLocal() {
  if (!dbLocal) {
    dbLocal = await open({
      filename: `./data/data-public.db`,
      driver: sqlite3.Database,
    });
  }
  return dbLocal;
}
/**
 * Get remote database
 */

let dbClient: PoolClient | undefined;

export async function dbLoadRemote() {
  if (!dbClient) {
    const connectionString = process.env.DB_URL;
    const pool = new Pool({
      connectionString,
      application_name: "climb-finder",
    });
    dbClient = await pool.connect();
  }
  return dbClient;
}

/**
 * Database request
 */

export async function dbQuery<Response>(
  query: string
): Promise<Response | undefined> {
  try {
    const isRemote = process.env.DB_REMOTE === "TRUE";
    if (isRemote) {
      const client = await dbLoadRemote();
      console.log("remote");
      const res = await client.query(query);
      return res.rows as Response;
    } else {
      const db = await dbLoadLocal();
      console.log("local");
      const rows = await db.all<Response>(query);
      return rows;
    }
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/**
 * Remove duplicates from array
 */
export function unique(arr: unknown[]) {
  return arr.filter((item, i) => arr.indexOf(item) === i);
}

/**
 * Sanitise string input
 */
export function sanitiseString(str: string) {
  return String(str)
    .replace(/[^\w\s]/gi, "")
    .slice(0, 50);
}
