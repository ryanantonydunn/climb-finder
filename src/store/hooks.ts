import React from "react";
import { useStore } from "./store";
import { Crag } from "./types";
import { getCrags } from "./helpers";

/**
 * Load grades data
 */
export function useGrades() {
  const loadGrades = useStore((state) => state.loadGrades);
  React.useEffect(() => {
    loadGrades();
  }, [loadGrades]);
}

/**
 * Initialise form object
 */
export function useForm() {
  const initForm = useStore((state) => state.initForm);
  React.useEffect(() => {
    initForm();
  }, [initForm]);
}

/**
 * Get crag data for use in form
 */
export function useCrags(ids: number[]) {
  const [crags, setCrags] = React.useState<Crag[]>([]);
  React.useEffect(() => {
    if (!ids.length) return;
    async function loadCrags() {
      const results = await getCrags(ids);
      setCrags(results);
    }
    loadCrags();
  }, [ids]);
  return crags;
}
