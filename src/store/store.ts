import { create } from "zustand";
import {
  getInitialForm,
  getQueryVarForm,
  isDesktop,
  loadGrades,
  search,
  setQueryStringFromForm,
} from "./helpers";
import { RouteSearchForm, ScreenLayout, Store } from "./types";

export const useStore = create<Store>((set, get) => ({
  screenLayout: [false, false, false],
  form: undefined,
  grades: undefined,
  results: undefined,
  isSearching: false,
  activeRoute: undefined,
  setScreenLayout: (layout) => {
    set(() => ({ screenLayout: layout }));
  },
  setForm: (newForm: Partial<RouteSearchForm>) => {
    const { form } = get();
    if (!form) return;
    set(() => ({ form: { ...form, ...newForm } }));
  },
  initForm: () => {
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
    const { form, grades, isSearching, screenLayout } = get();
    if (!grades || isSearching || !form) return;
    try {
      set({ isSearching: true });
      const results = await search(form, grades);
      await setQueryStringFromForm(form);
      const newScreenLayout = isDesktop()
        ? screenLayout
        : ([true, false, false] as ScreenLayout);
      set({ results, isSearching: false, screenLayout: newScreenLayout });
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
