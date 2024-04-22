import {
  GradeRange,
  GradesRef,
  GradesResponse,
  RouteSearchFilters,
  RouteSearchForm,
  RouteSearchLocationType,
  RouteSearchResults,
  RouteSearchSortKey,
  SortDirection,
} from "./types";

/**
 * Get the query var values for the form
 */
export function getQueryVarForm(): Partial<RouteSearchForm> {
  const params = new URLSearchParams(window.location.search);

  function getNum(key: string): number | undefined {
    if (!params.get(key)) return undefined;
    return Number(params.get(key));
  }

  function getBoolean(key: string): boolean | undefined {
    if (!params.get(key)) return undefined;
    return params.get(key) === "true";
  }

  function getString(key: string): string | undefined {
    if (!params.get(key)) return undefined;
    return String(params.get(key));
  }

  const cragIdsStr = params.get("cragIds");
  const cragIds = cragIdsStr
    ? cragIdsStr.split(",").map((id) => Number(id))
    : undefined;

  const gradeRanges = params.get("gradeRanges")
    ? getGradeRangesFromUrlVar(params.get("gradeRanges") || "")
    : undefined;

  const obj = {
    locationType: getString("locationType") as
      | RouteSearchLocationType
      | undefined,
    locationSearch: getString("locationSearch"),
    cragSearch: getString("cragSearch"),
    gradeRanges,
    lat: getNum("lat"),
    long: getNum("long"),
    routeNameFilter: params.get("routeNameFilter") || "",
    cragIds,
    distanceMax: getNum("distanceMax"),
    starsMin: getNum("starsMin"),
    starsMax: getNum("starsMax"),
    heightMin: getNum("heightMin"),
    heightMax: getNum("heightMax"),
    heightIncludeZero: getBoolean("heightIncludeZero"),
    pitchesMin: getNum("pitchesMin"),
    pitchesMax: getNum("pitchesMax"),
    pitchesIncludeZero: getBoolean("pitchesIncludeZero"),
    sortDirection: getString("sortDirection") as SortDirection | undefined,
    sortKey: getString("sortKey") as RouteSearchSortKey | undefined,
  };
  return Object.fromEntries(
    Object.entries(obj).filter((o) => o[1] !== undefined)
  );
}

/**
 * Get the initial form values with defaults or from the query string
 */
export function getInitialForm(
  partial: Partial<RouteSearchForm>
): RouteSearchForm {
  const defaults: RouteSearchForm = {
    locationType: "map",
    locationSearch: "",
    cragSearch: "",
    gradeRanges: getGradeRangesFromUrlVar("2,1,6"),
    lat: 53.74312,
    long: -2.01056,
    routeNameFilter: "",
    cragIds: [],
    distanceMax: 50,
    starsMin: 0,
    starsMax: 3,
    heightMin: 0,
    heightMax: 10000,
    heightIncludeZero: true,
    pitchesMin: 0,
    pitchesMax: 100,
    pitchesIncludeZero: true,
    sortDirection: "asc",
    sortKey: "id",
  };
  return Object.assign(defaults, partial);
}

/**
 * Set the query string in the URL from the form values
 */
export async function setQueryStringFromForm(form: RouteSearchForm) {
  const url = new URL(window.location.href);
  Object.entries(form).forEach(([key, value]) => {
    if (key === "gradeRanges") {
      url.searchParams.set(key, getUrlVarFromGradeRanges(value));
    } else if (key === "heightIncludeZero") {
      url.searchParams.set(key, value ? "true" : "false");
    } else if (key === "pitchesIncludeZero") {
      url.searchParams.set(key, value ? "true" : "false");
    } else {
      url.searchParams.set(key, value);
    }
  });
  history.pushState({}, "", url);
}

/**
 * Extract the grade range object from the query string
 */
function getGradeRangesFromUrlVar(str: string): GradeRange[] {
  if (!str) return [];
  return str.split("-").map((subStr) => {
    const [system, start, end] = subStr.split(",");
    return {
      system: Number(system),
      start: Number(start),
      end: Number(end),
    };
  });
}

/**
 * Prepare the grade range object for the query string
 */
function getUrlVarFromGradeRanges(ranges: GradeRange[]): string {
  return ranges.map((r) => `${r.system},${r.start},${r.end}`).join("-");
}

/**
 * Load the grades data and create reference object
 */
export async function loadGrades(): Promise<GradesRef> {
  const res = await fetch("/api/grades");
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const json = (await res.json()) as GradesResponse;

  // Reference object for all grades
  const gradesRef: GradesRef = {
    systemTypes: Object.fromEntries(
      json.systems.map((system) => [system.id, system.gradetype])
    ),
    types: Object.fromEntries(
      json.types.map((type) => [
        type.id,
        {
          name: type.name,
          systems: Object.fromEntries(
            json.systems
              .filter((s) => s.gradetype === type.id)
              .map((system) => {
                // get all grades in this type and system
                const grades = json.grades.filter(
                  (g) => g.gradesystem === system.id && g.gradetype === type.id
                );
                // prepare ids sorted by grade
                const gradeIds = grades
                  .sort((a, b) => a.score - b.score)
                  .map((g) => g.id);
                return [
                  system.id,
                  {
                    name: system.name,
                    gradeIds,
                    grades: Object.fromEntries(grades.map((g) => [g.id, g])),
                  },
                ];
              })
          ),
        },
      ])
    ),
  };

  return gradesRef;
}

/**
 * Search using the form
 */
export async function search(
  form: RouteSearchForm,
  grades: GradesRef
): Promise<RouteSearchResults> {
  const filters = getFiltersFromForm(form, grades);
  const res = await fetch("/api/search-routes", {
    method: "POST",
    body: JSON.stringify({ filters }),
  });
  console.log(res.ok);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const json = (await res.json()) as RouteSearchResults;
  console.log(json);
  return json;
}

/**
 * Get the filters necessary to make a route search from the form state
 */
function getFiltersFromForm(
  form: RouteSearchForm,
  grades: GradesRef
): RouteSearchFilters {
  // get all grade ids from the ranges
  const allGradeIds: number[] = [];
  form.gradeRanges.forEach((range) => {
    const gradeType = grades.systemTypes[range.system];
    const { gradeIds } = grades.types[gradeType].systems[range.system];
    allGradeIds.push(...gradeIds.slice(range.start, range.end + 1));
  });

  // duplicate all relevant fields
  const { locationType, gradeRanges, ...sharedValues } = form;
  if (locationType === "crags") {
    sharedValues.lat = undefined;
    sharedValues.long = undefined;
  } else {
    sharedValues.cragIds = [];
  }

  return { ...sharedValues, grades: allGradeIds };
}
