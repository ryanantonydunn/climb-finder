const fs = require("fs");
const {
  dbGetByDistance,
  dbLoadFull,
  dbRun,
  dbInsertArray,
  dbLoadPublic,
} = require("./db-utils");
const path = require("path");

const routeHeaderOrder = [
  "id",
  "buttress_id",
  "buttress_ordering",
  "climb_ordering",
  "name",
  "grade",
  "techgrade",
  "stars",
  "ok",
  "logs",
  "rockfax",
  "gradesystem",
  "gradetype",
  "gradescore",
  "height",
  "pitches",
  "slug",
  "has_topo",
  "rf_crag",
  "n_photos",
  "n_videos",
];

/**
 * Get route information from UKC crag pages
 */
async function getDataFromCragPages(db, list, areCragsNew) {
  for (let i = 0; i < list.length; i++) {
    const id = areCragsNew ? list[i][0] : list[i];
    const url = `https://www.ukclimbing.com/logbook/crag.php?id=${id}`;
    const res = await fetch(url);
    const str = await res.text();

    const name = str.match(/\<title\>UKC Logbook \- (.*)\<\/title\>/)?.[1];
    const routeDataStr = str.match(/table_data \= (.*)\n/)?.[1];

    if (!name || !routeDataStr) {
      console.log(`skipping crag id ${id} - no routes found`);
      continue;
    }
    const routes = JSON.parse(routeDataStr.slice(0, -1));

    // update crag name
    if (areCragsNew) {
      console.log(`creating crag ${id} - ${name}`);
      await dbInsertArray(db, "crags", [[...list[i].filter(Boolean), name]]);
    } else {
      console.log(`updating crag ${id} name to ${name}`);
      await dbRun(db, `update crags set name = "${name}" where id = ${id}`);
    }

    // save routes
    const routesArr = routes.map((route) => [
      ...routeHeaderOrder.map((key) => route[key]),
      id,
    ]);
    if (routesArr.length) {
      console.log(`inserting ${routesArr.length} routes from crag ${id}`);
      await dbInsertArray(db, "routes", routesArr);
    } else {
      console.log(`no routes from crag ${id}`);
    }
  }
}

/**
 * Return crags filtered and sorted by distance from a position
 */
async function getCragsByDistance(db, lat, long, distance) {
  const rows = await dbGetByDistance(db, lat, long, distance, "asc");
  console.log(`found ${rows.length} crags`);
  return rows;
}

/**
 * Get some crag info by distance
 */
async function getCragsDist(start = 0, end = 0) {
  const homeLat = 53.74312;
  const homeLong = -2.01056;
  const db = await dbLoadFull();
  const crags = await getCragsByDistance(db, homeLat, homeLong, 300);
  const cragIds = crags.slice(start, end).map((c) => c.id);
  await getDataFromCragPages(db, cragIds);
}

/**
 * Get some crag info from a file of [id, lat, long] data rows
 */
async function getCragsFromFile(filePath, start, end, ignore) {
  const db = await dbLoadPublic();
  const file = fs.readFileSync(path.join(__dirname, filePath));
  const crags = JSON.parse(file)
    .slice(start, end)
    .filter((c) => !ignore.includes(c[0]));
  await getDataFromCragPages(db, crags, true);
}

/**
 * Get some crag info from ids
 */
async function getCragsFromIds(ids) {
  const db = await dbLoadPublic();
  getDataFromCragPages(db, ids);
}

getCragsFromFile("crag-positions/filtered-2024-4-23.json", 100, 5000, [3116]);

// getCragsFromIds([3116]);
