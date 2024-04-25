const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

/**
 * File path of the database
 */
const dbPathFull = path.join(__dirname, "data-full.db");
const dbPathPublic = path.join(__dirname, "data-public.db");

/**
 * Get database
 */
async function dbLoad(filename) {
  const db = await open({
    filename,
    driver: sqlite3.Database,
  });
  return db;
}
const dbLoadFull = async () => dbLoad(dbPathFull);
const dbLoadPublic = async () => dbLoad(dbPathPublic);

/**
 * Load remote db
 */
async function dbLoadRemote() {
  const connectionString = process.env.DB_URL;
  const pool = new Pool({
    connectionString,
    application_name: "climb-finder",
  });
  const client = await pool.connect();
  return client;
}

/**
 * Create SQL string of values from an array
 * Eg: ["howdy", 1]  => '("howdy", 1)'
 */
function escapeHtml(str) {
  if (typeof str !== "string") {
    return str;
  }
  const escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  return `'${escaped}'`;
}
function getValueSqlStringFromArray(arr) {
  return `(${arr.map((cell) => escapeHtml(cell)).join(",")})`;
}

/**
 * Remove duplicates from array
 */
function unique(arr) {
  return arr.filter((item, i) => arr.indexOf(item) === i);
}

/**
 * Insert a multidimensional array of values into a table
 */
async function dbInsertArray(db, tableName, arr, headers) {
  const sqlHeaders = headers ? `(${headers.join(",")})` : "";
  const sqlValues = arr.map(getValueSqlStringFromArray).join(",");
  const createDataSql = `insert or replace into ${tableName}${sqlHeaders} values ${sqlValues};`;
  await dbRun(db, createDataSql);
  console.log("rows inserted");
}

/**
 * Affect rows in table
 */
async function dbRows(db, query) {
  try {
    const rows = await db.all(query);
    return rows;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Affect a single row
 */
async function dbRun(db, query) {
  try {
    const res = await db.run(query);
    return res;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  dbInsertArray,
  dbLoadFull,
  dbLoadPublic,
  dbLoadRemote,
  dbPathFull,
  dbPathPublic,
  dbRun,
  dbRows,
  getValueSqlStringFromArray,
  unique,
};
