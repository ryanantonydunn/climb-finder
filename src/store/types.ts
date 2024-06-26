export const maxNumber = 99999999;

export interface Crag {
  id: number;
  lat: number;
  long: number;
  name: string;
  distance?: number;
}

export const routeSearchSortKeys = [
  "id",
  "distance",
  "stars",
  "gradescore",
  "height",
  "name",
  "pitches",
  "crag_name",
] as const;

export type RouteSearchSortKey = (typeof routeSearchSortKeys)[number];

export type SortDirection = "asc" | "desc";

export interface RouteSearchFilters {
  lat: number | undefined;
  long: number | undefined;
  distanceMax: number;
  routeNameFilter: string;
  cragIds: number[];
  starsMin: number;
  starsMax: number;
  heightMin: number;
  heightMax: number;
  heightIncludeZero: boolean;
  pitchesMin: number;
  pitchesMax: number;
  pitchesIncludeZero: boolean;
  sortDirection: SortDirection;
  sortKey: RouteSearchSortKey;
  grades: number[];
}

export const routeSearchLocationTypes = ["map", "latlong", "crags"] as const;

export type RouteSearchLocationType = (typeof routeSearchLocationTypes)[number];

export type GradeRange = {
  system: number;
  start: number;
  end: number;
};

export interface RouteSearchForm extends Omit<RouteSearchFilters, "grades"> {
  locationType: RouteSearchLocationType;
  gradeRanges: GradeRange[];
  locationSearch: string;
  cragSearch: string;
}

export interface RouteSearchFormHook {
  form: RouteSearchForm | null;
  setForm: (form: Partial<RouteSearchForm>) => void;
}

export interface Route {
  id: number;
  name: string;
  grade: number;
  techgrade: string;
  stars: number;
  gradetype: number;
  gradescore: number;
  gradesystem: number;
  height: number;
  crag_id: number;
  pitches: number;
}

export interface RouteSearchResults {
  routes: Route[];
  crags: Crag[];
}

export interface GradeType {
  id: number;
  name: string;
}

export interface GradeSystem {
  id: number;
  name: string;
  gradetype: number;
}

export interface Grade {
  id: number;
  name: string;
  gradesystem: number;
  gradetype: number;
  score: number;
}

export interface GradesRef {
  systemTypes: { [key: number]: number };
  types: {
    [key: number]: {
      name: string;
      systems: {
        [key: number]: {
          name: string;
          gradeIds: number[];
          grades: {
            [key: number]: Grade;
          };
        };
      };
    };
  };
}

export interface GradesResponse {
  types: GradeType[];
  systems: GradeSystem[];
  grades: Grade[];
}

export type RouteSearchFn = (filters: RouteSearchForm, ref: GradesRef) => void;

export type ScreenLayout = [boolean, boolean, boolean];

export interface Store {
  screenLayout: ScreenLayout;
  form: RouteSearchForm | undefined;
  grades: GradesRef | undefined;
  results: RouteSearchResults | undefined;
  isSearching: boolean;
  activeRoute: number | undefined;
  setScreenLayout: (layout: ScreenLayout) => void;
  setForm: (form: Partial<RouteSearchForm>) => void;
  initForm: () => void;
  loadGrades: () => void;
  search: () => void;
  setActiveRoute: (n: number | undefined) => void;
}
