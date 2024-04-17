import { create } from "zustand";
import { RouteSearchForm, Store } from "./types";
import {
  getInitialForm,
  loadGrades,
  search,
  setQueryStringFromForm,
} from "./helpers";

export const useStore = create<Store>((set, get) => ({
  form: undefined,
  grades: undefined,
  results: undefined,
  isSearching: false,
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
    const results = await search(form, grades);
    await setQueryStringFromForm(form);
    set({ results, isSearching: false });
  },
}));
