import { Crag, Route, RouteSearchFilters } from "@/store/types";
import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";

export async function POST(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    const data = await req.json();
    const filters = data.filters as RouteSearchFilters;

    /**
     * Get crags
     */
    let cragFilter = "";
    let cragOrderBy = "";
    if (filters.sortKey === "crag_name") {
      cragOrderBy = ` order by name  ${filters.sortDirection}`;
    }
    if (filters.lat !== undefined && filters.long !== undefined) {
      // search by lat/long
      const distance = filters.distanceMax / 1000;
      const cosLat2 = Math.cos((filters.lat * Math.PI) / 180) ^ 2;
      const distanceQueryString = `((${filters.lat}-lat)*(${filters.lat}-lat)) + ((${filters.long}-long)*(${filters.long}-long)*${cosLat2})`;
      cragFilter = `where ${distanceQueryString} < ${distance}${cragOrderBy}`;
      if (filters.sortKey === "distance") {
        cragOrderBy = ` order by ${distanceQueryString} ${filters.sortDirection}`;
      }
    } else if (filters.cragIds?.length) {
      cragFilter = ` where id in (${filters.cragIds.join(",")})`;
    }
    const cragQuery = `
      select * from crags
        ${cragFilter}
        ${cragOrderBy}
        limit 3000
    `;
    console.log(cragQuery);
    const cragRows = await db.all<Crag[]>(cragQuery);
    const cragIds = cragRows.map((r) => r.id);

    const cragIdsForFilter = cragIds.join(",");
    const cragIdsForSort = getCragOrderQueryString(cragIds);

    /**
     * Get routes using crag information
     */
    const routeFields = [
      "id",
      "name",
      "grade",
      "techgrade",
      "stars",
      "gradetype",
      "gradesystem",
      "gradescore",
      "height",
      "pitches",
      "crag_id",
    ].join(",");

    const routeSort = ["distance", "crag_name"].includes(filters.sortKey)
      ? cragIdsForSort
      : filters.sortKey;

    const heightFilterBase = `height >= ${filters.heightMin} and height <= ${filters.heightMax}`;
    const heightFilterWithZero = `id in (select id from routes where height = 0 or ${heightFilterBase})`;
    const heightFilter = filters.heightIncludeZero
      ? heightFilterWithZero
      : heightFilterBase;

    const pitchesFilterBase = `pitches >= ${filters.pitchesMin} and pitches <= ${filters.pitchesMax}`;
    const pitchesFilterWithZero = `id in (select id from routes where (pitches = 1 and height != 0) or ${pitchesFilterBase})`;
    const pitchesFilter = filters.pitchesIncludeZero
      ? pitchesFilterWithZero
      : pitchesFilterBase;

    const routeName = filters.routeNameFilter
      ? `name like '%${filters.routeNameFilter}%' and`
      : ``;

    const gradeFilter = filters.grades.length
      ? `grade in (${filters.grades.join(",")}) and`
      : "";

    const routeQuery = `
      select ${routeFields} from routes
        where
          crag_id in (${cragIdsForFilter}) and
          stars >= ${filters.starsMin} and
          stars <= ${filters.starsMax} and
          ${routeName}
          ${gradeFilter}
          ${heightFilter} and
          ${pitchesFilter}
        order by ${routeSort} ${filters.sortDirection}
        limit 200
      `;

    const routeRows = await db.all<Route[]>(routeQuery);

    // return data
    const result = {
      routes: routeRows,
      crags: cragRows,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Generate a query string to sort by the list of crag ID's
 * To be used when sorting by distance as the filter will use the crag ID's, which will be sorted by distance from the previous query
 */
function getCragOrderQueryString(ids: number[]) {
  let str = "case crag_id";
  ids.forEach((id, i) => {
    str += ` when ${id} then ${i}`;
  });
  str += " end";
  return str;
}
