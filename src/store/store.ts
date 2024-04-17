import { create } from "zustand";
import { RouteSearchForm, Store } from "./types";
import {
  getInitialForm,
  loadGrades,
  search,
  setQueryStringFromForm,
} from "./helpers";

export const useStore = create<Store>((set, get) => ({
  form: getInitialForm(),
  grades: undefined,
  results: undefined,
  isSearching: false,
  setForm: (form: Partial<RouteSearchForm>) =>
    set((prev) => ({ form: { ...prev.form, ...form } })),
  loadGrades: async () => {
    try {
      const grades = await loadGrades();
      set({ grades });
    } catch (e) {
      console.error(e);
    }
  },
  search: async () => {
    const { form, grades, isSearching } = get();
    if (!grades || isSearching) return;
    set({ isSearching: true });
    const results = await search(form, grades);
    await setQueryStringFromForm(form);
    set({ results, isSearching: false });
  },
}));
