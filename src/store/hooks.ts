import React from "react";
import { useStore } from "./store";

/**
 * Load grades data
 */
export function useGrades() {
  const loadGrades = useStore((state) => state.loadGrades);
  React.useEffect(() => {
    loadGrades();
  }, [loadGrades]);
}
