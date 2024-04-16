import React from "react";
import {
  RouteSearchFormHook,
  GradeIdsByType,
  GradeRange,
  Grades,
  RouteSearchResults,
  RouteSearchSortKey,
  RouteSearchForm,
  RouteSearchLocationType,
  SortDirection,
} from "./types";

export function useData() {
  // Handle getting results
  const [results, setResults] = React.useState<RouteSearchResults | null>(null);

  const search = React.useCallback(
    (form: RouteSearchForm, gradeIdsByType: GradeIdsByType) => {
      async function runSearch() {
        try {
          /**
           * Build filters from form
           */
          // get all grades from the ranges
          const grades: number[] = [];
          Object.entries(form.gradeRanges).forEach(([id, [start, end]]) => {
            const gradeTypeId = Number(id);
            grades.push(...gradeIdsByType[gradeTypeId].slice(start, end + 1));
          });

          // duplicate all relevant fields
          const { locationType, gradeRanges, ...sharedValues } = form;
          if (locationType !== "crags") {
            sharedValues.cragIds = [];
          }

          const filters = { ...sharedValues, grades };

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
    },
    []
  );

  return { results, search };
}

export function useGrades(): Grades | null {
  const [results, setResults] = React.useState<Grades | null>(null);

  React.useEffect(() => {
    async function get() {
      const res = await fetch("/api/grades");
      const json = (await res.json()) as Grades;

      /**
       * Reference object for all grade ID's available
       * Eg: { 2: [3,4,5], ... } // where 2 is 'Trad' and 3,4,5 are 'S','HS','VS'
       */
      const idsByType = Object.fromEntries(
        json.gradeTypes.map((t) => [
          t.id,
          json.grades
            .filter((g) => g.gradetype === t.id)
            .sort((a, b) => a.score - b.score)
            .map((g) => g.id),
        ])
      );

      setResults({ ...json, idsByType });
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
    gradeRanges: getGradeRangesFromUrlVar(params.get("gradeRanges") || ""),
    lat: Number(params.get("lat") || 53.74312),
    long: Number(params.get("long") || -2.01056),
    routeNameFilter: params.get("routeNameFilter") || "",
    cragIds: cragIds ? cragIds.split(",").map((id) => Number(id)) : [],
    distanceMax: Number(params.get("distanceMax") || 0.05),
    starsMin: Number(params.get("starsMin") || 0),
    starsMax: Number(params.get("starsMax") || 3),
    heightMin: Number(params.get("heightMin") || 0),
    heightMax: Number(params.get("heightMax") || 10000),
    heightIncludeZero: !params.get("heightIncludeZero") ? false : true,
    sortDirection: (params.get("sortDirection") || "asc") as SortDirection,
    sortKey: (params.get("sortKey") || "id") as RouteSearchSortKey,
  };
}

/**
 * Extract the grade range object from the query string
 * Eg: 1,3,4-2,4,5 => { 1: [3,4], 2: [4,5] }
 */
function getGradeRangesFromUrlVar(str: string): GradeRange {
  if (!str) return {};
  return Object.fromEntries(
    str.split("-").map((subStr) => {
      const [id, start, end] = subStr.split(",");
      return [Number(id), [Number(start), Number(end)]];
    })
  );
}

/**
 * Prepare the grade range object for the query string
 * Eg: { 1: [3,4], 2: [4,5] } => 1,3,4-2,4,5
 */
function getUrlVarFromGradeRanges(ranges: GradeRange): string {
  return Object.entries(ranges)
    .map(([id, [start, end]]) => `${id},${start},${end}`)
    .join("-");
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
      if (value) {
        url.searchParams.set(key, "true");
      } else {
        url.searchParams.delete(key);
      }
    } else {
      url.searchParams.set(key, value);
    }
  });
  history.pushState({}, "", url);
}
