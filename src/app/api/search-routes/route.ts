import {
  ClimbingRoute,
  ClimbingRouteSearchFilters,
  Location,
} from "@/store/types";
import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";

export async function POST(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    const data = await req.json();
    const filters = data.filters as ClimbingRouteSearchFilters;

    /**
     * Get crags
     */
    let locationQuery = "";
    if (filters.cragIds.length) {
      locationQuery = `
        select * from locations
          where id in (${filters.cragIds.join(",")})
          limit 400
      `;
    } else {
      // search by lat/long
      const cosLat2 = Math.cos((filters.lat * Math.PI) / 180) ^ 2;
      const distanceQueryString = `((${filters.lat}-lat)*(${filters.lat}-lat)) + ((${filters.long}-long)*(${filters.long}-long)*${cosLat2})`;
      const LocationSort =
        filters.sortKey === "distance"
          ? ` order by ${distanceQueryString} ${filters.sortDirection}`
          : "";
      locationQuery = `
        select * from locations
          where ${distanceQueryString} < ${filters.distanceMax}${LocationSort}
          limit 400
      `;
    }
    console.log(locationQuery);
    const locationRows = await db.all<Location[]>(locationQuery);
    const cragIds = locationRows.map((r) => r.id);

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
      "gradescore",
      "height",
      "crag_id",
    ].join(",");

    const routeSort =
      filters.sortKey === "distance" ? cragIdsForSort : filters.sortKey;

    const heightFilterBase = `height >= ${filters.heightMin} and height <= ${filters.heightMax}`;
    const heightFilterWithZero = `id in (select id from routes where height = 0 or ${heightFilterBase})`;
    const heightFilter = filters.heightIncludeZero
      ? heightFilterWithZero
      : heightFilterBase;

    const routeName = filters.routeNameFilter
      ? `name like '%${filters.routeNameFilter}%' and`
      : ``;

    const gradeIds = filters.grades.join(",");

    const routeQuery = `
      select ${routeFields} from routes
        where
          crag_id in (${cragIdsForFilter}) and
          stars >= ${filters.starsMin} and
          stars <= ${filters.starsMax} and
          ${routeName}
          ${heightFilter} and
          grade in (${gradeIds})
        order by ${routeSort} ${filters.sortDirection}
        limit 1000
      `;

    const routeRows = await db.all<ClimbingRoute[]>(routeQuery);

    // return data
    const result = {
      routes: routeRows,
      locations: locationRows,
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
