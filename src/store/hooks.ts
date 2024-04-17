import React from "react";
import {
  GradeRange,
  GradesRef,
  GradesResponse,
  RouteSearchForm,
  RouteSearchFormHook,
  RouteSearchLocationType,
  RouteSearchResults,
  RouteSearchSortKey,
  SortDirection,
} from "./types";

export function useData() {
  // Handle getting results
  const [results, setResults] = React.useState<RouteSearchResults | null>(null);

  const search = React.useCallback((form: RouteSearchForm, ref: GradesRef) => {
    async function runSearch() {
      try {
        /**
         * Build filters from form
         */
        // get all grade ids from the ranges
        const allGradeIds: number[] = [];
        form.gradeRanges.forEach((range) => {
          const gradeType = ref.systemTypes[range.system];
          const { gradeIds } = ref.types[gradeType].systems[range.system];
          allGradeIds.push(...gradeIds.slice(range.start, range.end + 1));
        });

        // duplicate all relevant fields
        const { locationType, gradeRanges, ...sharedValues } = form;
        if (locationType !== "crags") {
          sharedValues.cragIds = [];
        }

        const filters = { ...sharedValues, grades: allGradeIds };

        /**
         * Make the API call with the filters
         */
        const res = await fetch("/api/search-routes", {
          method: "POST",
          body: JSON.stringify({ filters }),
        });
        const json = (await res.json()) as RouteSearchResults;
        setResults(json);
        setQueryStringFromForm(form);
      } catch (e) {
        console.error(e);
      }
    }
    runSearch();
  }, []);

  return { results, search };
}

export function useGrades(): GradesRef | null {
  const [results, setResults] = React.useState<GradesRef | null>(null);

  React.useEffect(() => {
    async function get() {
      const res = await fetch("/api/grades");
      const json = (await res.json()) as GradesResponse;

      /**
       * Reference object for all grades
       */
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
                      (g) =>
                        g.gradesystem === system.id && g.gradetype === type.id
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
                        grades: Object.fromEntries(
                          grades.map((g) => [g.id, g])
                        ),
                      },
                    ];
                  })
              ),
            },
          ])
        ),
      };

      setResults(gradesRef);
    }
    get();
  }, []);

  return results;
}

export function useForm(): RouteSearchFormHook {
  const [form, setFormRaw] = React.useState<RouteSearchForm | null>(null);
  const setForm = React.useCallback(
    (newFormItems: Partial<RouteSearchForm>) => {
      setFormRaw((f) => (f ? { ...f, ...newFormItems } : null));
    },
    []
  );
  React.useEffect(() => {
    setFormRaw(getInitialForm());
  }, []);

  return { form, setForm };
}

/**
 * Get the initial form values with defaults or from the query string
 */
function getInitialForm(): RouteSearchForm {
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
    sortDirection: (params.get("sortDirection") || "asc") as SortDirection,
    sortKey: (params.get("sortKey") || "id") as RouteSearchSortKey,
  };
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
 * Set the query string in the URL from the form values
 */

function setQueryStringFromForm(form: RouteSearchForm) {
  const url = new URL(window.location.href);
  Object.entries(form).forEach(([key, value]) => {
    if (key === "gradeRanges") {
      url.searchParams.set(key, getUrlVarFromGradeRanges(value));
    } else if (key === "heightIncludeZero") {
      url.searchParams.set(key, value ? "true" : "false");
    } else {
      url.searchParams.set(key, value);
    }
  });
  history.pushState({}, "", url);
}
