export interface Crag {
  id: number;
  lat: number;
  long: number;
  name: string;
}

export type RouteSearchSortKey =
  | "id"
  | "distance"
  | "stars"
  | "gradescore"
  | "height"
  | "name"
  | "crag_name";

export type SortDirection = "asc" | "desc";

export interface RouteSearchFilters {
  lat: number;
  long: number;
  distanceMax: number;
  routeNameFilter: string;
  cragIds: number[];
  starsMin: number;
  starsMax: number;
  heightMin: number;
  heightMax: number;
  heightIncludeZero: boolean;
  sortDirection: SortDirection;
  sortKey: RouteSearchSortKey;
  grades: number[];
}

export const routeSearchLocationTypes = ["map", "latlong", "crags"] as const;

export type RouteSearchLocationType = (typeof routeSearchLocationTypes)[number];

export type GradeRange = { [key: number]: [number, number] };

export interface RouteSearchForm extends Omit<RouteSearchFilters, "grades"> {
  locationType: RouteSearchLocationType;
  gradeRanges: GradeRange;
}

export interface RouteSearchFormHook {
  form: RouteSearchForm | null;
  setForm: (form: Partial<RouteSearchForm>) => void;
}

export interface ClimbingRoute {
  id: number;
  name: string;
  grade: number;
  techgrade: string;
  stars: number;
  gradetype: number;
  gradescore: number;
  height: number;
  crag_id: number;
}

export interface RouteSearchResults {
  routes: ClimbingRoute[];
  crags: Crag[];
}

export interface GradeType {
  id: number;
  name: string;
}

export interface Grade {
  id: number;
  name: string;
  gradesystem: number;
  gradetype: number;
  score: number;
}

export interface GradeIdsByType {
  [key: number]: number[];
}

export interface Grades {
  gradeTypes: GradeType[];
  grades: Grade[];
  idsByType: GradeIdsByType;
}

export type RouteSearchFn = (
  filters: RouteSearchForm,
  idsByType: GradeIdsByType
) => void;
