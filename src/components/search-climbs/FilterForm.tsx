"use client";

import { RouteSearchFormHook, Grades, RouteSearchFn } from "@/store/types";

interface FilterFormProps {
  search: RouteSearchFn;
  grades: Grades | null;
  form: RouteSearchFormHook;
}

export function FilterForm({ search, grades, form: formObj }: FilterFormProps) {
  if (!grades || !grades.idsByType || !formObj.form) return "Loading...";
  const { form, setForm } = formObj;

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
              value="locationNames"
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
          const all = grades.idsByType[gradeType.id];
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
          const all = grades.idsByType[gradeTypeId];
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
        onClick={() => search(form, grades.idsByType)}
      >
        Search
      </button>
    </div>
  );
}
