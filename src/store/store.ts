import { create } from "zustand";
import { RouteSearchForm, Store } from "./types";
import {
  getInitialForm,
  loadGrades,
  search,
  setDistances,
  setQueryStringFromForm,
} from "./helpers";

export const useStore = create<Store>((set, get) => ({
  form: undefined,
  grades: undefined,
  results: undefined,
  isSearching: false,
  activeRoute: undefined,
  setForm: (newForm: Partial<RouteSearchForm>) => {
    const { form } = get();
    if (!form) return;
    set(() => ({ form: { ...form, ...newForm } }));
  },
  initForm: () => {
    set(() => ({ form: getInitialForm() }));
  },
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
    if (!grades || isSearching || !form) return;
    set({ isSearching: true });
    const resultsRaw = await search(form, grades);
    const results = setDistances(form, resultsRaw);
    await setQueryStringFromForm(form);
    set({ results, isSearching: false });
  },
  setActiveRoute: (n: number | undefined) => {
    set(() => ({ activeRoute: n }));
  },
}));
