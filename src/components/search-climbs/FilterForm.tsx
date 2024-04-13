"use client";

import { ClimbingRouteSearchFilters } from "@/store/types";
import React from "react";

interface FilterFormProps {
  search: (filters: ClimbingRouteSearchFilters) => void;
}

const climbingTypes = [{ type: 2, system: 2, name: "Trad" }];

export function FilterForm({ search }: FilterFormProps) {
  const [filtersLocal, setFiltersLocalRaw] =
    React.useState<ClimbingRouteSearchFilters>({
      lat: 53.74312,
      long: -2.01056,
      routeNameFilter: "crack",
      cragIds: [],
      distanceMax: 0.05,
      starsMin: 2,
      starsMax: 3,
      heightMin: 0,
      heightMax: 1000,
      heightIncludeZero: true,
      gradeType: 2,
      gradeSystem: 2,
      gradeScoreMin: 4,
      gradeScoreMax: 10,
      sortDirection: "asc",
      sortKey: "distance",
    });
  const setFiltersLocal = React.useCallback(
    (filters: Partial<ClimbingRouteSearchFilters>) => {
      setFiltersLocalRaw((f) => ({ ...f, ...filters }));
    },
    []
  );

  const [climbingType, setClimbingType] = React.useState(2);

  return (
    <div className="p-2 text-xs">
      <div className="mb-2">
        <label>Route name filter</label>
        <input
          className="p-2"
          type="text"
          value={filtersLocal.lat}
          onChange={(e) =>
            setFiltersLocal({ lat: Number(e.currentTarget.value) })
          }
        />
      </div>
      <div className="mb-2">
        <label>Include crags</label>
        <input
          className="p-2"
          type="text"
          value={filtersLocal.lat}
          onChange={(e) =>
            setFiltersLocal({ lat: Number(e.currentTarget.value) })
          }
        />
      </div>
      <div className="mb-2">
        <label>Search by location</label>
        <input
          className="p-2"
          type="text"
          value={filtersLocal.lat}
          onChange={(e) =>
            setFiltersLocal({ lat: Number(e.currentTarget.value) })
          }
        />
      </div>
      <div className="flex mb-2">
        <label>Search by lat/long position</label>
        <div>
          <input
            className="p-2"
            type="text"
            value={filtersLocal.lat}
            onChange={(e) =>
              setFiltersLocal({ lat: Number(e.currentTarget.value) })
            }
          />
        </div>
        <div>
          <input
            className="p-2"
            type="text"
            value={filtersLocal.long}
            onChange={(e) =>
              setFiltersLocal({ long: Number(e.currentTarget.value) })
            }
          />
        </div>
      </div>
      <div className="mb-2">
        <label>Distance</label>
        <br />
        <input className="p-2" type="text" />
        &nbsp; km
      </div>
      <div className="mb-2">
        <label>Climbing type</label>
        <select
          value={climbingType}
          onChange={(e) => setClimbingType(Number(e.currentTarget.value))}
        >
          {climbingTypes.map((c) => (
            <option key={c.type} value={c.type}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex mb-2">
        <div>
          <label>Min grade</label>
          <br />
          <select
            value={filtersLocal.gradeScoreMax}
            onChange={(e) =>
              setFiltersLocal({ gradeScoreMax: Number(e.currentTarget.value) })
            }
          >
            <option value="150">150</option>
          </select>
        </div>
        <div>
          <label>Max grade</label>
          <br />
          <select
            value={filtersLocal.gradeScoreMax}
            onChange={(e) =>
              setFiltersLocal({ gradeScoreMax: Number(e.currentTarget.value) })
            }
          >
            <option value="150">150</option>
          </select>
        </div>
      </div>
      <div className="flex mb-2">
        <div>
          <label>Min height</label>
          <br />
          <select
            value={filtersLocal.heightMin}
            onChange={(e) =>
              setFiltersLocal({ heightMin: Number(e.currentTarget.value) })
            }
          >
            <option value="150">150</option>
          </select>
        </div>
        <div>
          <label>Max height</label>
          <br />
          <select
            value={filtersLocal.gradeScoreMax}
            onChange={(e) =>
              setFiltersLocal({ gradeScoreMax: Number(e.currentTarget.value) })
            }
          >
            <option value="150">150</option>
          </select>
        </div>
      </div>
      <div className="mb-2">
        <label>
          <input type="checkbox" />
          Include routes with no height data
        </label>
      </div>
      <button className="p-2 bg-green-800" onClick={() => search(filtersLocal)}>
        Search
      </button>
    </div>
  );
}
