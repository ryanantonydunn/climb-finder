import React from "react";
import { useStore } from "@/store/store";
import { Route } from "@/store/types";

export function useRenderGrade() {
  const { grades } = useStore();
  return React.useCallback(
    (route: Route) => {
      if (!grades) return "";
      const gradeType = grades.types[route.gradetype];
      const gradeSystem = gradeType?.systems[route.gradesystem];
      const grade = gradeSystem?.grades[route.grade];
      if (grade) {
        return `${grade.name} ${route.techgrade || ""}`;
      } else {
        return "Unknown";
      }
    },
    [grades]
  );
}
export function renderStars(route: Route) {
  return (
    <>
      {route.stars >= 1 && <span>&#9733;</span>}
      {route.stars >= 2 && <span>&#9733;</span>}
      {route.stars >= 3 && <span>&#9733;</span>}
    </>
  );
}

export function renderName(str: string) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: str,
      }}
    ></span>
  );
}
