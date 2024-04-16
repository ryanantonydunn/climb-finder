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
    let cragQuery = "";
    const cragOrderBy = filters.sortKey === "crag_name" ? "order by name" : "";
    if (filters.cragIds.length) {
      cragQuery = `
        select * from crags
          where id in (${filters.cragIds.join(",")})
          ${cragOrderBy}
          limit 400
      `;
    } else {
      // search by lat/long
      const cosLat2 = Math.cos((filters.lat * Math.PI) / 180) ^ 2;
      const distanceQueryString = `((${filters.lat}-lat)*(${filters.lat}-lat)) + ((${filters.long}-long)*(${filters.long}-long)*${cosLat2})`;
      const cragSort =
        filters.sortKey === "distance"
          ? ` order by ${distanceQueryString} ${filters.sortDirection}`
          : "";
      cragQuery = `
        select * from crags
          where ${distanceQueryString} < ${filters.distanceMax}${cragSort}
          ${cragOrderBy}
          limit 400
      `;
    }
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
      "gradescore",
      "height",
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
