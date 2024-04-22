import { create } from "zustand";
import { RouteSearchForm, Store } from "./types";
import {
  getInitialForm,
  getQueryVarForm,
  loadGrades,
  search,
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
    const { search } = get();
    const queryVarForm = getQueryVarForm();
    const initialForm = getInitialForm(queryVarForm);
    set(() => ({ form: initialForm }));
  },
  loadGrades: async () => {
    try {
      const grades = await loadGrades();
      set({ grades });
    } catch (e) {
      console.error(e);
      alert("Error loading grades, check logs");
    }
  },
  search: async () => {
    const { form, grades, isSearching } = get();
    if (!grades || isSearching || !form) return;
    try {
      set({ isSearching: true });
      const results = await search(form, grades);
      await setQueryStringFromForm(form);
      set({ results, isSearching: false });
    } catch (e) {
      console.error(e);
      alert("Error loading search results, check logs");
      set({ isSearching: false });
    }
  },
  setActiveRoute: (n: number | undefined) => {
    set(() => ({ activeRoute: n }));
  },
}));
