"use client";

import {
  ClimbingGradeRange,
  ClimbingGrades,
  ClimbingRouteSearchFilters,
  ClimbingRouteSortKey,
  ClimbingSearchForm,
  ClimbingSearchLocationType,
  SortDirection,
} from "@/store/types";
import React from "react";

interface FilterFormProps {
  search: (filters: ClimbingRouteSearchFilters) => void;
  grades: ClimbingGrades | null;
}

/**
 * Extract the grade range object from the query string
 * Eg: 1,3,4-2,4,5 => { 1: [3,4], 2: [4,5] }
 */
function getGradeRangesFromUrlVar(str: string): ClimbingGradeRange {
  if (!str) return {};
  return Object.fromEntries(
    str.split("-").map((subStr) => {
      const [id, start, end] = subStr.split(",");
      return [Number(id), [Number(start), Number(end)]];
    })
  );
}

/**
 * Prepare the grade range object for the query string
 * Eg: { 1: [3,4], 2: [4,5] } => 1,3,4-2,4,5
 */
function getUrlVarFromGradeRanges(ranges: ClimbingGradeRange): string {
  return Object.entries(ranges)
    .map(([id, [start, end]]) => `${id},${start},${end}`)
    .join("-");
}

/**
 * Set the query string in the URL from the form values
 */

function setQueryStringFromForm(form: ClimbingSearchForm) {
  const url = new URL(window.location.href);
  Object.entries(form).forEach(([key, value]) => {
    if (key === "gradeRanges") {
      url.searchParams.set(key, getUrlVarFromGradeRanges(value));
    } else if (key === "heightIncludeZero") {
      if (value) {
        url.searchParams.set(key, "true");
      } else {
        url.searchParams.delete(key);
      }
    } else {
      url.searchParams.set(key, value);
    }
  });
  history.pushState({}, "", url);
}

/**
 * Get the initial form values with defaults or from the query string
 */
function getInitialForm(): ClimbingSearchForm {
  const params = new URLSearchParams(window.location.search);
  const cragIds = params.get("cragIds");
  return {
    locationType: (params.get("locationType") ||
      "map") as ClimbingSearchLocationType,
    gradeRanges: getGradeRangesFromUrlVar(params.get("gradeRanges") || ""),
    lat: Number(params.get("lat") || 53.74312),
    long: Number(params.get("long") || -2.01056),
    routeNameFilter: params.get("routeNameFilter") || "",
    cragIds: cragIds ? cragIds.split(",").map((id) => Number(id)) : [],
    distanceMax: Number(params.get("distanceMax") || 0.05),
    starsMin: Number(params.get("starsMin") || 0),
    starsMax: Number(params.get("starsMax") || 3),
    heightMin: Number(params.get("heightMin") || 0),
    heightMax: Number(params.get("heightMax") || 10000),
    heightIncludeZero: !params.get("heightIncludeZero") ? false : true,
    sortDirection: (params.get("sortDirection") || "asc") as SortDirection,
    sortKey: (params.get("sortKey") || "id") as ClimbingRouteSortKey,
  };
}

export function FilterForm({ search, grades }: FilterFormProps) {
  const [form, setFormRaw] = React.useState<ClimbingSearchForm | undefined>();
  const setForm = React.useCallback(
    (newFormItems: Partial<ClimbingSearchForm>) => {
      setFormRaw((f) => (f ? { ...f, ...newFormItems } : undefined));
    },
    []
  );
  React.useEffect(() => {
    setFormRaw(getInitialForm());
  }, []);

  /**
   * Reference object for all grade ID's available
   * Eg: { 2: [3,4,5], ... } // where 2 is 'Trad' and 3,4,5 are 'S','HS','VS'
   */
  const allGrades = React.useMemo(() => {
    if (grades) {
      return Object.fromEntries(
        grades.gradeTypes.map((t) => [
          t.id,
          grades.grades
            .filter((g) => g.gradetype === t.id)
            .sort((a, b) => a.score - b.score)
            .map((g) => g.id),
        ])
      );
    }
    return null;
  }, [grades]);

  /**
   * Get compiled filters to search from form state
   */
  const getFiltersFromForm = React.useCallback(
    (form: ClimbingSearchForm): ClimbingRouteSearchFilters | undefined => {
      if (!allGrades) return;

      // get all grades from the ranges
      const grades: number[] = [];
      Object.entries(form.gradeRanges).forEach(([id, [start, end]]) => {
        const gradeTypeId = Number(id);
        grades.push(...allGrades[gradeTypeId].slice(start, end + 1));
      });

      // duplicate all relevant fields
      const { locationType, gradeRanges, ...sharedValues } = form;
      if (locationType !== "crags") {
        sharedValues.cragIds = [];
      }

      return {
        ...sharedValues,
        grades,
      };
    },
    [allGrades]
  );

  /**
   * Run the search
   */
  const runSearch = React.useCallback(() => {
    if (!form) return;
    const filters = getFiltersFromForm(form);
    if (!filters) return;
    setQueryStringFromForm(form);
    search(filters);
  }, [form, getFiltersFromForm, search]);

  /**
   * Render form
   */
  if (!grades || !allGrades || !form) return "Loading...";

  return (
    <div className="p-2 pb-6 text-xs">
      <div className="mb-2">
        <h2 className="mb-2 font-bold text-base">Location</h2>
        <div className="mb-2">
          <label className="inline-block mb-1 mr-1 p-1 whitespace-nowrap">
            <input
              className="w-4 h-4 mr-2"
              type="radio"
              value="search"
              checked={form.locationType === "map"}
              onChange={() => {
                setForm({ locationType: "map" });
              }}
            />{" "}
            Search on map
          </label>
          <label className="inline-block mb-1 mr-1 p-1 whitespace-nowrap">
            <input
              className="w-4 h-4 mr-2"
              type="radio"
              value="latlong"
              checked={form.locationType === "latlong"}
              onChange={() => {
                setForm({ locationType: "latlong" });
              }}
            />{" "}
            Lat/Long
          </label>
          <label className="inline-block mb-1 mr-1 p-1 whitespace-nowrap">
            <input
              className="w-4 h-4 mr-2"
              type="radio"
              value="crags"
              checked={form.locationType === "crags"}
              onChange={() => {
                setForm({ locationType: "crags" });
              }}
            />{" "}
            Search crags
          </label>
        </div>
        {form.locationType === "map" && (
          <div className="mb-2">
            <label>Search by location</label>
            <br />
            <input
              className="bg-gray-700 p-1"
              type="text"
              value={"howdy"}
              onChange={(e) => {
                console.log("TODO");
              }}
            />
          </div>
        )}
        {form.locationType === "latlong" && (
          <div className="mb-2">
            <label>Search by lat/long position</label>
            <div className="flex mb-2">
              <div>
                <input
                  className="bg-gray-700 p-1"
                  type="text"
                  value={form.lat}
                  onChange={(e) => {
                    setForm({
                      lat: Number(e.currentTarget.value),
                    });
                  }}
                />
              </div>
              <div>
                <input
                  className="bg-gray-600 p-1"
                  type="text"
                  value={form.long}
                  onChange={(e) => {
                    setForm({
                      long: Number(e.currentTarget.value),
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {form.locationType === "crags" && (
          <div className="mb-2">
            <label>Search crags</label>
            <br />
            <input className="bg-gray-600 p-1" type="text" />
          </div>
        )}
        {["latlong", "map"].includes(form.locationType) && (
          <div className="mb-2">
            <label>Distance</label>
            <br />
            <input
              className="bg-gray-600 p-1"
              type="text"
              value={form.distanceMax}
              onChange={(e) => {
                setForm({
                  distanceMax: Number(e.currentTarget.value),
                });
              }}
            />
            &nbsp; km
          </div>
        )}
      </div>
      <div className="mb-2">
        <h2 className="mb-2 font-bold text-base">Climbing types</h2>
        {grades.gradeTypes.map((gradeType) => {
          const all = allGrades[gradeType.id];
          const range = form.gradeRanges[gradeType.id];
          return (
            <label
              key={gradeType.id}
              className="inline-block mb-1 mr-1 p-1 whitespace-nowrap"
            >
              <input
                className="w-4 h-4 mr-2"
                type="checkbox"
                checked={!!range}
                onChange={() => {
                  if (!!range) {
                    // remove all grades
                    const newGradeRanges = { ...form.gradeRanges };
                    delete newGradeRanges[gradeType.id];
                    setForm({ gradeRanges: newGradeRanges });
                  } else {
                    // add all grades
                    setForm({
                      gradeRanges: {
                        ...form.gradeRanges,
                        [gradeType.id]: [0, all.length - 1],
                      },
                    });
                  }
                }}
              />
              {gradeType.name}
            </label>
          );
        })}
      </div>
      <div className="mb-4">
        {Object.entries(form.gradeRanges).length > 0 && (
          <h2 className="mb-2 font-bold text-base">Grades</h2>
        )}
        {Object.entries(form.gradeRanges).map(([typeId, [start, end]]) => {
          const gradeTypeId = Number(typeId);
          const all = allGrades[gradeTypeId];
          const gradeTypeName =
            grades.gradeTypes.find((g) => g.id === gradeTypeId)?.name || "";
          return (
            <div key={gradeTypeId} className="mb-2">
              <label className="block mb-1">{gradeTypeName} grade range</label>
              <div className="flex gap-2">
                <select
                  className="bg-gray-600 p-1"
                  value={start}
                  onChange={(e) => {
                    const newMinimum = Number(e.currentTarget.value);
                    setForm({
                      gradeRanges: {
                        ...form.gradeRanges,
                        [gradeTypeId]: [newMinimum, end],
                      },
                    });
                  }}
                  aria-label={`${gradeTypeName} grade range minimum`}
                >
                  {all.map((gradeId, i) => {
                    const grade = grades.grades.find((g) => g.id === gradeId);
                    return (
                      <option
                        key={`grade-min-${gradeId}`}
                        value={i}
                        disabled={end <= i}
                      >
                        {grade?.name}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="bg-gray-600 p-1"
                  value={end}
                  onChange={(e) => {
                    const newMaximum = Number(e.currentTarget.value);
                    setForm({
                      gradeRanges: {
                        ...form.gradeRanges,
                        [gradeTypeId]: [start, newMaximum],
                      },
                    });
                  }}
                  aria-label={`${gradeTypeName} grade range maximum`}
                >
                  {all.map((gradeId, i) => {
                    const grade = grades.grades.find((g) => g.id === gradeId);
                    return (
                      <option
                        key={`grade-max-${gradeId}`}
                        value={i}
                        disabled={start >= i}
                      >
                        {grade?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mb-2">
        <h2 className="mb-2 font-bold text-base">Height</h2>
        <div className="flex mb-2 gap-2">
          <div>
            <label>Min height</label>
            <br />
            <input
              className="bg-gray-600 p-1"
              type="number"
              value={form.heightMin}
              onChange={(e) => {
                const newNum = Math.min(
                  Number(e.currentTarget.value),
                  form.heightMax
                );
                setForm({
                  heightMin: newNum,
                });
              }}
            />
          </div>
          <div>
            <label>Max height</label>
            <br />
            <input
              className="bg-gray-600 p-1"
              type="number"
              value={form.heightMax}
              onChange={(e) => {
                const newNum = Math.max(
                  Number(e.currentTarget.value),
                  form.heightMin
                );
                setForm({
                  heightMax: newNum,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label className="block mb-1 mr-1 p-1 whitespace-nowrap">
          <input
            className="bg-gray-600 p-1 w-4 h-4 mr-2"
            type="checkbox"
            checked={form.heightIncludeZero}
            onChange={() =>
              setForm({
                heightIncludeZero: !form.heightIncludeZero,
              })
            }
          />
          Include routes with no height data
        </label>
      </div>
      <div className="mb-2">
        <h2 className="mb-2 font-bold text-base">Stars</h2>
        <div className="flex mb-2 gap-2">
          <div>
            <label>Min stars</label>
            <br />
            <select
              className="bg-gray-600 p-1"
              value={form.starsMin}
              onChange={(e) => {
                setForm({ starsMin: Number(e.currentTarget.value) });
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <option key={i} value={i} disabled={form.starsMax < i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Max stars</label>
            <br />
            <select
              className="bg-gray-600 p-1"
              value={form.starsMax}
              onChange={(e) => {
                setForm({ starsMax: Number(e.currentTarget.value) });
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <option key={i} value={i} disabled={form.starsMin > i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-base">Search route names</h2>
        <input
          className="bg-gray-600 p-1"
          type="text"
          value={form.routeNameFilter}
          onChange={(e) => {
            setForm({
              routeNameFilter: e.currentTarget.value,
            });
          }}
          aria-label="Search route names"
        />
      </div>
      <button
        className="w-full p-2 bg-green-800 rounded"
        onClick={() => runSearch()}
      >
        Search
      </button>
    </div>
  );
}
