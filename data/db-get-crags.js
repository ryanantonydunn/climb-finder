// const grade_type_list = { 2: "Trad" };

const {
  dbGetByDistance,
  dbLoadFull,
  dbRun,
  dbInsertArray,
} = require("./db-utils");

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
async function getDataFromCragPages(db, ids) {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
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
    console.log(`updating crag ${id} name to ${name}`);
    await dbRun(db, `update locations set name = "${name}" where id = ${id}`);

    // save routes
    const routesArr = routes.map((route) => [
      ...routeHeaderOrder.map((key) => route[key]),
      id,
    ]);
    console.log(`inserting ${routesArr.length} routes from crag ${id}`);
    await dbInsertArray(db, "routes", routesArr);
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
 * Get some crag info
 */
async function getCrags(start = 0, end = 0) {
  const homeLat = 53.74312;
  const homeLong = -2.01056;
  const db = await dbLoadFull();
  const crags = await getCragsByDistance(db, homeLat, homeLong, 300);
  const cragIds = crags.slice(start, end).map((c) => c.id);
  await getDataFromCragPages(db, cragIds);
}
getCrags();
