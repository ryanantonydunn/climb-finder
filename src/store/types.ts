export interface Location {
  id: number;
  lat: number;
  long: number;
  name: string;
}

export type ClimbingRouteSortKey =
  | "id"
  | "distance"
  | "stars"
  | "gradescore"
  | "height"
  | "name"
  | "crag_name";

export type SortDirection = "asc" | "desc";

export interface ClimbingRouteSearchFilters {
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
  sortKey: ClimbingRouteSortKey;
  grades: number[];
}

export const searchLocationTypes = ["map", "latlong", "crags"] as const;

export type ClimbingSearchLocationType = (typeof searchLocationTypes)[number];

export type ClimbingGradeRange = { [key: number]: [number, number] };

export interface ClimbingSearchForm
  extends Omit<ClimbingRouteSearchFilters, "grades"> {
  locationType: ClimbingSearchLocationType;
  gradeRanges: ClimbingGradeRange;
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

export interface ClimbingRouteSearchResults {
  routes: ClimbingRoute[];
  locations: Location[];
}

export interface ClimbingGradeType {
  id: number;
  name: string;
}

export interface ClimbingGrade {
  id: number;
  name: string;
  gradesystem: number;
  gradetype: number;
  score: number;
}

export interface ClimbingGrades {
  gradeTypes: ClimbingGradeType[];
  grades: ClimbingGrade[];
}
