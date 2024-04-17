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
 * Get the initial form values with defaults or from the query string
 */
export function getInitialForm(): RouteSearchForm {
  const params = new URLSearchParams(window.location.search);
  const cragIds = params.get("cragIds");
  return {
    locationType: (params.get("locationType") ||
      "map") as RouteSearchLocationType,
    gradeRanges: getGradeRangesFromUrlVar(params.get("gradeRanges") || "2,1,6"),
    lat: Number(params.get("lat") || 53.74312),
    long: Number(params.get("long") || -2.01056),
    routeNameFilter: params.get("routeNameFilter") || "",
    cragIds: cragIds ? cragIds.split(",").map((id) => Number(id)) : [],
    distanceMax: Number(params.get("distanceMax") || 50),
    starsMin: Number(params.get("starsMin") || 0),
    starsMax: Number(params.get("starsMax") || 3),
    heightMin: Number(params.get("heightMin") || 0),
    heightMax: Number(params.get("heightMax") || 10000),
    heightIncludeZero:
      params.get("heightIncludeZero") === "false" ? false : true,
    pitchesMin: Number(params.get("pitchesMin") || 0),
    pitchesMax: Number(params.get("pitchesMax") || 100),
    pitchesIncludeZero:
      params.get("pitchesIncludeZero") === "false" ? false : true,
    sortDirection: (params.get("sortDirection") || "asc") as SortDirection,
    sortKey: (params.get("sortKey") || "id") as RouteSearchSortKey,
  };
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
  const json = (await res.json()) as RouteSearchResults;
  console.log(json);
  return json;
}

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
  if (locationType !== "crags") {
    sharedValues.cragIds = [];
  }

  return { ...sharedValues, grades: allGradeIds };
}
