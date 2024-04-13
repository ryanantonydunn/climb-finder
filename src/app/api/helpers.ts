import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

/**
 * Get database
 */

let db: Database<sqlite3.Database, sqlite3.Statement> | undefined;

export async function dbLoad() {
  if (!db) {
    db = await open({
      filename: `./data/data-public.db`,
      driver: sqlite3.Database,
    });
  }
  return db;
}

/**
 * Remove duplicates from array
 */
export function unique(arr: unknown[]) {
  return arr.filter((item, i) => arr.indexOf(item) === i);
}
