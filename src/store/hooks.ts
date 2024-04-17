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

/**
 * Initialise form object
 */
export function useForm() {
  const initForm = useStore((state) => state.initForm);
  React.useEffect(() => {
    initForm();
  }, [initForm]);
}
