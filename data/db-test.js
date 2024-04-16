const {
  dbLoadFull,
  dbRows,
  getValueSqlStringFromArray,
  unique,
  dbLoadPublic,
  dbRun,
} = require("./db-utils");

const homeLat = 53.74312;
const homeLong = -2.01056;

function getDistanceQueryString(lat, long) {
  const cosLat2 = Math.cos((lat * Math.PI) / 180) ^ 2;
  return `((${lat}-lat)*(${lat}-lat)) + ((${long}-long)*(${long}-long)*${cosLat2})`;
}

function getCragOrderQueryString(ids) {
  let str = "case crag_id";
  ids.forEach((id, i) => {
    str += ` when ${id} then ${i}`;
  });
  str += " end";
  return str;
}

async function dbTestSearch() {
  const db = await dbLoadFull();

  // build query string
  const lat = homeLat;
  const long = homeLong;
  const maxDistance = 0.05;
  const minStars = 2;
  const maxStars = 3;
  const gradeType = 2;
  const gradeSystem = 2;
  const gradeScoreMin = 4;
  const gradeScoreMax = 10;
  const sortDirection = "asc";
  const sortKey = "distance";

  // get grade information
  const gradeQuery = `
    select * from grades
      where
        gradetype in (${gradeType}) and
        gradesystem in (${gradeSystem}) and
        score >= ${gradeScoreMin} and
        score <= ${gradeScoreMax}
      `;
  const gradeRows = await dbRows(db, gradeQuery);
  const gradeIds = gradeRows.map((r) => r.id).join(",");
  const gradeTypes = unique(gradeRows.map((r) => r.gradetype)).join(",");

  // get grade type information
  const gradeTypeQuery = `
    select * from grade_types
      where
        id in (${gradeTypes})
  `;
  const gradeTypeRows = await dbRows(db, gradeTypeQuery);

  // get crags within distance filters
  const fields = [
    "id",
    "name",
    "grade",
    "techgrade",
    "stars",
    "gradetype",
    "gradescore",
    "height",
    "crag_id",
  ].join(",");
  const distanceQueryString = getDistanceQueryString(lat, long);
  const cragSort =
    sortKey === "distance"
      ? ` order by ${distanceQueryString} ${sortDirection}`
      : "";
  const cragQuery = `select * from crags where ${distanceQueryString} < ${maxDistance}${cragSort}`;
  const cragRows = await dbRows(db, cragQuery);
  const cragIds = cragRows.map((r) => r.id);

  const cragIdsForFilter = cragIds.join(",");
  const cragIdsForSort = getCragOrderQueryString(cragIds);

  // get routes using grades and crags
  const routeSort = sortKey === "distance" ? cragIdsForSort : sortKey;
  const routeQuery = `
    select ${fields} from routes
      where
        crag_id in (${cragIdsForFilter}) and
        stars >= ${minStars} and
        stars <= ${maxStars} and
        grade in (${gradeIds})
      order by ${routeSort} ${sortDirection}
    `;
  const routeRows = await dbRows(db, routeQuery);

  // return data
  const data = {
    routes: routeRows,
    crags: cragRows,
    gradeTypes: gradeTypeRows,
    grades: gradeRows,
  };

  console.log(data);
}

async function dbTestSearch2() {
  const db = await dbLoadPublic();

  // get routes using grades and crags
  const routeQuery = `
    select id,name from routes
      where
        name like '%crack%'
      limit 20
    `;
  const routeRows = await dbRows(db, routeQuery);

  console.log(routeRows);
}

async function renameTable() {
  const db = await dbLoadPublic();
  const query = `
    alter table locations
    rename to crags
    `;
  await dbRun(db, query);
}

renameTable();
