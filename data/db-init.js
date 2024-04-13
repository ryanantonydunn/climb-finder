const { dbPathFull, dbLoadFull, dbInsertArray, dbRun } = require("./db-utils");
const fs = require("fs");
const path = require("path");

async function createTableLocations(db) {
  console.log("creating locations table");
  const query = `
    create table routes (
      id integer primary key,
      buttress_id integer,
      buttress_ordering integer,
      climb_ordering integer,
      name string,
      grade integer,
      techgrade string,
      stars integer,
      ok integer,
      logs integer,
      rockfax integer,
      gradesystem integer,
      gradetype integer,
      gradescore float,
      height integer,
      pitches integer,
      slug string,
      has_topo integer,
      rf_crag integer,
      n_photos integer,
      n_videos integer,
      crag_id integer
    );
  `;
  await dbRun(db, query);
}

async function createTableRoutes(db) {
  console.log("creating routes table");
  const query = `
    create table locations (
      id integer primary key,
      lat float,
      long float,
      name string
    );
  `;
  await dbRun(db, query);
}

async function createTableGradeTypes(db) {
  console.log("creating grade_types table");
  const query = `
    create table grade_types (
      id integer primary key,
      name string
    );
  `;
  await dbRun(db, query);
}

async function createTableGrades(db) {
  console.log("creating grades table");
  const query = `
    create table grades (
      id integer primary key,
      name string,
      gradesystem integer,
      gradetype integer
      score integer,
    );
  `;
  await dbRun(db, query);
}

async function initLocations(db) {
  // load all crags and remove duplicates
  const crags = [];
  for (let i = 0; i < 9; i++) {
    const jsonPath = path.join(
      __dirname,
      "../../peak-ticker/data/scraped-crag-positions",
      `${i}.json`
    );
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);
    console.log(`preparing file: ${i} - count: ${json.length}`);
    for (let j = 0; j < json.length; j++) {
      const row = [json[j][0], json[j][2], json[j][1], ""];
      if (crags.find((c) => c[0] === row[0])) {
        continue;
      }
      crags.push(row);
    }
  }

  // initialise crag positions from json file to crag-positions db
  console.log(`writing rows: ${crags.length}`);
  await dbInsertArray(db, "locations", crags);
}

async function dbInitMain() {
  // check if database already exists
  if (fs.existsSync(dbPathFull)) {
    console.error("Database already exists");
    return;
  }

  // create database
  const db = await dbLoadFull();

  await createTableLocations(db);
  await createTableRoutes(db);
  await createTableGradeTypes(db);
  await createTableGrades(db);

  await initLocations(db);
}

dbInitMain();
