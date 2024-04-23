const {
  dbPathFull,
  dbLoadFull,
  dbInsertArray,
  dbRun,
  dbLoadPublic,
  dbRows,
} = require("./db-utils");
const fs = require("fs");
const path = require("path");

async function createTableRoutes(db) {
  console.log("creating routes table");
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

async function createTableCrags(db) {
  console.log("creating crags table");
  const query = `
    create table crags (
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

async function createTableGradeSystems(db) {
  console.log("creating grade_systems table");
  const query = `
    create table grade_systems (
      id integer primary key,
      gradetype integer,
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

async function initCrags(db, overwrite = false) {
  // load all crags and remove duplicates
  let crags = [];
  let total = 0;
  for (let i = 0; i < 11; i++) {
    const jsonPath = path.join(__dirname, "crag-positions", `${i}.json`);
    const file = fs.readFileSync(jsonPath);
    const json = JSON.parse(file);
    console.log(`preparing file: ${i} - count: ${json.length}`);
    total += json.length;
    for (let j = 0; j < json.length; j++) {
      const row = [json[j][0], json[j][2], json[j][1], ""];
      if (crags.find((c) => c[0] === row[0])) {
        continue;
      }
      crags.push(row);
    }
  }

  console.log(`total rows: ${total}`);
  console.log(`total without duplicates: ${crags.length}`);

  // if not overwriting remove items that already exist
  if (!overwrite) {
    const ids = crags.map((c) => c[0]).join(",");
    const cragQuery = `select id from crags where id in (${ids})`;
    const rows = await dbRows(db, cragQuery);
    console.log(`already set: ${rows.length}`);
    crags = crags.filter((c) => !rows.find((r) => r.id === Number(c[0])));
  }

  // initialise crag positions from json file to crag-positions db
  console.log(`writing rows: ${crags.length}`);
  await dbInsertArray(db, "crags", crags);
}

async function dbInitMain() {
  // check if database already exists
  // if (fs.existsSync(dbPathFull)) {
  //   console.error("Database already exists");
  //   return;
  // }

  // create database
  const db = await dbLoadPublic();

  // await createTableCrags(db);
  // await createTableRoutes(db);
  // await createTableGradeTypes(db);
  // await createTableGradeSystems(db);
  // await createTableGrades(db);
  // await initCrags(db);
}

dbInitMain();
