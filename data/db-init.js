const {
  dbPathFull,
  dbLoadFull,
  dbInsertArray,
  dbRun,
  dbLoadPublic,
  dbRows,
  dbLoadRemote,
  getValueSqlStringFromArray,
} = require("./db-utils");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const createTableRoutes = `
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

const createTableCrags = `
    create table crags (
      id integer primary key,
      lat float,
      long float,
      name string
    );
  `;

const createTableGradeTypes = `
    create table grade_types (
      id integer primary key,
      name string
    );
  `;

const createTableGradeSystems = `
    create table grade_systems (
      id integer primary key,
      gradetype integer,
      name string
    );
  `;

const createTableGrades = `
    create table grades (
      id integer primary key,
      name string,
      gradesystem integer,
      gradetype integer,
      score integer
    );
  `;

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

async function dbInitLocal() {
  // check if database already exists
  // if (fs.existsSync(dbPathFull)) {
  //   console.error("Database already exists");
  //   return;
  // }

  // create database
  const db = await dbLoadPublic();
  await dbRun(db, createTableCrags);
  await dbRun(db, createTableRoutes);
  await dbRun(db, createTableGradeTypes);
  await dbRun(db, createTableGradeSystems);
  await dbRun(db, createTableGrades);
  await initCrags(db);
}

async function dbInitRemote() {
  const client = await dbLoadRemote();
  // client.query(createTableCrags);
  // await client.query(createTableRoutes);
  // await client.query(createTableGradeTypes);
  // await client.query(createTableGradeSystems);
  // await client.query(createTableGrades);

  // copy rows
  const db = await dbLoadPublic();

  // crags
  // const crags = await dbRows(db, "select * from crags");
  // const cragsStr = crags
  //   .map((r) => `(${[r.id, r.lat, r.long, `'${r.name}'`].join(",")})`)
  //   .join(",");
  // await client.query(`INSERT INTO crags (id,lat,long,name) VALUES ${cragsStr};`);

  // grades
  // const grades = await dbRows(db, "select * from grades");
  // const gradesStr = grades
  //   .map(
  //     (r) =>
  //       `(${[r.id, `'${r.name}'`, r.gradesystem, r.gradetype, r.score].join(
  //         ","
  //       )})`
  //   )
  //   .join(",");
  // await client.query(`INSERT INTO grades VALUES ${gradesStr};`);

  // grade_systems
  // const grade_systems = await dbRows(db, "select * from grade_systems");
  // const grade_systemsStr = grade_systems
  //   .map((r) => `(${[r.id, r.gradetype, `'${r.name}'`].join(",")})`)
  //   .join(",");
  // await client.query(`INSERT INTO grade_systems VALUES ${grade_systemsStr};`);

  // // grade_types
  // const grade_types = await dbRows(db, "select * from grade_types");
  // const grade_typesStr = grade_types
  //   .map((r) => `(${[r.id, `'${r.name}'`].join(",")})`)
  //   .join(",");
  // await client.query(`INSERT INTO grade_types VALUES ${grade_typesStr};`);

  // routes
  // const routes = await dbRows(db, "select * from routes");
  // const routesStr = routes
  //   .slice(100000, 300000)
  //   .map((r) =>
  //     getValueSqlStringFromArray([
  //       Number(r.id),
  //       Number(r.buttress_id),
  //       Number(r.buttress_ordering),
  //       Number(r.climb_ordering),
  //       String(r.name),
  //       Number(r.grade),
  //       String(r.techgrade || ""),
  //       Number(r.stars),
  //       Number(r.ok),
  //       Number(r.logs),
  //       Number(r.rockfax),
  //       Number(r.gradesystem),
  //       Number(r.gradetype),
  //       Number(r.gradescore),
  //       Number(r.height),
  //       Number(r.pitches),
  //       String(r.slug),
  //       Number(r.has_topo),
  //       Number(r.rf_crag),
  //       Number(r.n_photos),
  //       Number(r.crag_id),
  //     ])
  //   )
  //   .join(",");
  // console.log(routesStr.slice(0, 10000));

  // await client.query(`INSERT INTO routes VALUES ${routesStr};`);

  // route cragIDS
  const routes = await dbRows(
    db,
    "select * from routes limit 100000 offset 200000"
  );
  const setCragIdMapStr = routes
    .map((route) => `WHEN ${route.id} THEN ${route.crag_id} `)
    .join("");

  const setCragIdMapIds = routes.map((route) => route.id).join(",");

  const routeCragIdQuery = `UPDATE routes SET crag_id = (CASE id ${setCragIdMapStr} end) WHERE id IN (${setCragIdMapIds});`;
  await client.query(routeCragIdQuery);
  client.end();
}

dbInitRemote();
