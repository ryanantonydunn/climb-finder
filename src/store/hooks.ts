import React from "react";
import {
  ClimbingGrades,
  ClimbingRouteSearchFilters,
  ClimbingRouteSearchResults,
} from "./types";

export function useData() {
  // local state of filters in the form
  const [filters, setFilters] =
    React.useState<ClimbingRouteSearchFilters | null>(null);

  // Handle getting results
  const [results, setResults] =
    React.useState<ClimbingRouteSearchResults | null>(null);

  const search = React.useCallback((filters: ClimbingRouteSearchFilters) => {
    async function runSearch() {
      setFilters(filters);
      const res = await fetch("/api/search-routes", {
        method: "POST",
        body: JSON.stringify({ filters }),
      });
      const json = (await res.json()) as ClimbingRouteSearchResults;
      setResults(json);
    }
    runSearch();
  }, []);

  return { filters, results, search };
}

export function useGrades(): ClimbingGrades | null {
  const [results, setResults] = React.useState<ClimbingGrades | null>(null);

  React.useEffect(() => {
    async function get() {
      const res = await fetch("/api/grades");
      const json = (await res.json()) as ClimbingGrades;
      setResults(json);
    }
    get();
  }, []);

  return results ? { ...results } : null;
}
