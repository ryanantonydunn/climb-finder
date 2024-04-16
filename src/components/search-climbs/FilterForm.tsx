"use client";

import { GradesRef, RouteSearchFn, RouteSearchFormHook } from "@/store/types";
import React from "react";

interface FilterFormProps {
  search: RouteSearchFn;
  gradesRef: GradesRef | null;
  form: RouteSearchFormHook;
}

export function FilterForm({
  search,
  gradesRef,
  form: formObj,
}: FilterFormProps) {
  if (!gradesRef || !formObj.form) return "Loading...";
  const { form, setForm } = formObj;

  return (
    <div className="p-2 pb-6 text-xs">
      <div className="mb-2">
        <h2 className="mb-2 font-bold text-base">Location</h2>
        <div className="mb-2">
          <label className="inline-block mb-1 mr-1 p-1 px-2 bg-gray-700 rounded whitespace-nowrap">
            <input
              className="w-3 h-3 mr-1"
              type="radio"
              value="search"
              checked={form.locationType === "map"}
              onChange={() => {
                setForm({ locationType: "map" });
              }}
            />
            Search
          </label>
          <label className="inline-block mb-1 mr-1 p-1 px-2 bg-gray-700 rounded whitespace-nowrap">
            <input
              className="w-3 h-3 mr-1"
              type="radio"
              value="latlong"
              checked={form.locationType === "latlong"}
              onChange={() => {
                setForm({ locationType: "latlong" });
              }}
            />
            Lat/Long
          </label>
          <label className="inline-block mb-1 mr-1 p-1 px-2 bg-gray-700 rounded whitespace-nowrap">
            <input
              className="w-3 h-3 mr-1"
              type="radio"
              value="crags"
              checked={form.locationType === "crags"}
              onChange={() => {
                setForm({ locationType: "crags" });
              }}
            />
            Crags
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
      <div className="mb-4">
        <h2 className="mb-2 font-bold text-base">Grade ranges</h2>
        {form.gradeRanges.map((range, i) => {
          const gradeType = gradesRef.systemTypes[range.system];
          const { gradeIds, grades } =
            gradesRef.types[gradeType].systems[range.system];
          return (
            <div key={i} className="mb-2 flex gap-2">
              <div className="flex-grow">
                <select
                  className="bg-gray-600 p-1 w-full"
                  value={range.system}
                  onChange={(e) => {
                    const newSystemId = Number(e.currentTarget.value);
                    const newSystemType = gradesRef.systemTypes[newSystemId];
                    const newSystem =
                      gradesRef.types[newSystemType].systems[newSystemId];
                    console.log(
                      newSystemId,
                      newSystemType,
                      newSystem,
                      gradesRef
                    );
                    const newRanges = [...form.gradeRanges];
                    newRanges[i] = {
                      system: Number(e.currentTarget.value),
                      start: 0,
                      end: newSystem.gradeIds.length - 1,
                    };
                    setForm({ gradeRanges: newRanges });
                  }}
                >
                  {Object.entries(gradesRef.types).map(([typeId, type], i) => (
                    <optgroup key={typeId} label={type.name}>
                      {Object.entries(type.systems).map(
                        ([systemId, system]) => (
                          <option key={systemId} value={systemId}>
                            {type.name !== system.name
                              ? `${type.name}: ${system.name}`
                              : system.name}
                          </option>
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="bg-gray-600 p-1 w-full"
                  value={range.start}
                  onChange={(e) => {
                    const newRanges = [...form.gradeRanges];
                    newRanges[i] = {
                      ...newRanges[i],
                      start: Number(e.currentTarget.value),
                    };
                    setForm({ gradeRanges: newRanges });
                  }}
                >
                  {gradeIds.map((gradeId, gradeIdIndex) => (
                    <option
                      key={gradeIdIndex}
                      value={gradeIdIndex}
                      disabled={range.end < gradeIdIndex}
                    >
                      {grades[gradeId].name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="bg-gray-600 p-1 w-full"
                  value={range.end}
                  onChange={(e) => {
                    const newRanges = [...form.gradeRanges];
                    newRanges[i] = {
                      ...newRanges[i],
                      end: Number(e.currentTarget.value),
                    };
                    setForm({ gradeRanges: newRanges });
                  }}
                >
                  {gradeIds.map((gradeId, gradeIdIndex) => (
                    <option
                      key={gradeIdIndex}
                      value={gradeIdIndex}
                      disabled={range.start > gradeIdIndex}
                    >
                      {grades[gradeId].name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  className="bg-gray-800 rounded py-1 px-2"
                  aria-label="remove"
                  onClick={() => {
                    const newRanges = [...form.gradeRanges];
                    newRanges.splice(i, 1);
                    setForm({ gradeRanges: newRanges });
                  }}
                >
                  &#x2715;
                </button>
              </div>
            </div>
          );
        })}
        <button
          className="bg-gray-700 rounded py-1 px-2"
          onClick={() => {
            const newRanges = [
              ...form.gradeRanges,
              { system: 2, start: 1, end: 12 },
            ];
            setForm({ gradeRanges: newRanges });
          }}
        >
          + Add
        </button>
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
        onClick={() => search(form, gradesRef)}
      >
        Search
      </button>
    </div>
  );
}
