import {
  Crag,
  Route,
  RouteSearchFilters,
  maxNumber,
  routeSearchSortKeys,
} from "@/store/types";
import { NextResponse } from "next/server";
import { dbQuery, sanitiseString } from "../helpers";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const filters = data.filters as RouteSearchFilters;

    /**
     * Sanitise inputs
     */
    const floats = [
      filters.distanceMax,
      filters.heightMin,
      filters.heightMax,
      filters.lat,
      filters.long,
    ];
    floats.forEach((n) => {
      if (n === undefined) return;
      if (!isNumber(n)) throw new Error("Non-numeric input detected");
      if (isTooBig(n)) throw new Error("Too-large number detected");
    });
    const integers = [
      filters.pitchesMax,
      filters.pitchesMin,
      filters.starsMin,
      filters.starsMax,
      ...filters.cragIds,
      ...filters.grades,
    ];
    integers.forEach((n) => {
      if (n === undefined) return;
      if (!Number.isInteger(n)) throw new Error("Non integer input detected");
      if (isTooBig(n)) throw new Error("Too-large number detected");
    });
    [filters.heightIncludeZero, filters.pitchesIncludeZero].forEach((b) => {
      if (typeof b !== "boolean") throw new Error("Non boolean input detected");
    });
    filters.routeNameFilter = sanitiseString(filters.routeNameFilter);
    if (!["asc", "desc"].includes(filters.sortDirection)) {
      throw new Error("Invalid sort direction");
    }
    if (!routeSearchSortKeys.includes(filters.sortKey)) {
      throw new Error("Invalid sort key");
    }

    /**
     * Get crags
     */
    let cragQuery = "";
    if (filters.lat !== undefined && filters.long !== undefined) {
      // search by lat/long
      const distanceMax = filters.distanceMax / 10000;
      const sf = Math.PI / 180; // scaling factor
      const distanceQueryString = `acos(sin(lat*${sf})*sin(${filters.lat}*${sf}) + cos(lat*${sf})*cos(${filters.lat}*${sf})*cos((long-(${filters.long}))*${sf}))`;
      const sortQuery =
        filters.sortKey === "distance"
          ? `order by distance ${filters.sortDirection}`
          : "";
      cragQuery = `
        select * from (select *, (${distanceQueryString}) as distance from crags)
          where distance < ${distanceMax}
          ${sortQuery}
          limit 3000
      `;
    } else if (filters.cragIds?.length) {
      // search by crag ids
      const sortQuery =
        filters.sortKey === "crag_name"
          ? `order by name ${filters.sortDirection}`
          : "";
      cragQuery = `
        select * from crags
          where id in (${filters.cragIds.join(",")})
          ${sortQuery}
          limit 3000
      `;
    }

    const cragRows = await dbQuery<Crag[]>(cragQuery);
    if (!cragRows) throw new Error("Failed to load crags");

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
    const routeRows = await dbQuery<Route[]>(routeQuery);
    if (!routeRows) throw new Error("Failed to load routes");

    // return data
    const result = {
      routes: routeRows,
      crags: cragRows,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(err);
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

/**
 * Check inputs
 */
function isNumber(n: unknown) {
  return typeof n === "number" && isFinite(n);
}
function isTooBig(n: number) {
  return n > maxNumber;
}
