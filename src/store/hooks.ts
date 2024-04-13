import React from "react";
import {
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
