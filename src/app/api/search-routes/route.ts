import { NextApiRequest, NextApiResponse } from "next";
import { dbLoad, unique } from "../helpers";
import {
  ClimbingGrade,
  ClimbingGradeType,
  ClimbingRoute,
  ClimbingRouteSearchFilters,
  Location,
} from "@/store/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    // build query string
    const filters = {
      lat: 53.74312,
      long: -2.01056,
      distanceMax: 0.05,
      routeNameFilter: "crack",
      cragIds: [1112, 1356, 1248, 120, 108],
      // cragIds: [],
      starsMin: 2,
      starsMax: 3,
      heightMin: 10,
      heightMax: 1000,
      heightIncludeZero: true,
      gradeType: 2,
      gradeSystem: 2,
      gradeScoreMin: 4,
      gradeScoreMax: 10,
      sortDirection: "asc",
      sortKey: "distance",
    };

    /**
     * Get grades
     */
    const gradeQuery = `
      select * from grades
        where
          gradetype in (${filters.gradeType}) and
          gradesystem in (${filters.gradeSystem}) and
          score >= ${filters.gradeScoreMin} and
          score <= ${filters.gradeScoreMax}
        `;
    const gradeRows = await db.all<ClimbingGrade[]>(gradeQuery);
    const gradeIds = gradeRows.map((r) => r.id).join(",");
    const gradeTypes = unique(gradeRows.map((r) => r.gradetype)).join(",");

    /**
     * Get grade types
     */
    const gradeTypeQuery = `
      select * from grade_types
        where
          id in (${gradeTypes})
    `;
    const gradeTypeRows = await db.all<ClimbingGradeType[]>(gradeTypeQuery);

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
      gradeTypes: gradeTypeRows,
      grades: gradeRows,
    };
    return NextResponse.json(result, { status: 200 });
    // return NextResponse.json({ result: "howdy" }, { status: 200 });
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
