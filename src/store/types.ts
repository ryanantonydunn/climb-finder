export interface Location {
  id: number;
  lat: number;
  long: number;
  name: string;
}

export type ClimbingRouteSortKey =
  | "distance"
  | "stars"
  | "gradescore"
  | "height"
  | "name"
  | "crag_name";

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
  gradeType: number;
  gradeSystem: number;
  gradeScoreMin: number;
  gradeScoreMax: number;
  sortDirection: "asc" | "desc";
  sortKey: ClimbingRouteSortKey;
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

export interface ClimbingRouteSearchResults {
  routes: ClimbingRoute[];
  locations: Location[];
  gradeTypes: ClimbingGradeType[];
  grades: ClimbingGrade[];
}
