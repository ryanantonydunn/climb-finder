"use client";

import { useStore } from "@/store/store";
import { RouteSearchLocationType } from "@/store/types";
import React from "react";
import { Button } from "../base/Button";
import { Label } from "../base/Label";
import { Select } from "../base/Select";
import { Tag } from "../base/Tag";
import { TextInput } from "../base/TextInput";

const locationTypes = [
  ["map", "Map"],
  ["latlong", "Lat/Long"],
  ["crags", "Crags"],
];

export function FilterForm() {
  const { grades: gradesRef, form, setForm, search } = useStore();

  if (!gradesRef) return "Loading...";

  return (
    <div className="pb-6 text-xs">
      <div className="p-2 pb-0 border-b border-slate-300">
        <Label>Location</Label>
        {locationTypes.map(([key, name]) => (
          <React.Fragment key={key}>
            <Tag
              className="mr-1 mb-2"
              checked={form.locationType === key}
              onClick={() => {
                setForm({ locationType: key as RouteSearchLocationType });
              }}
            >
              {name}
            </Tag>
          </React.Fragment>
        ))}
        {form.locationType === "map" && (
          <TextInput
            id="search-location"
            label="Search by location"
            showLabel={false}
            iconLeft={<>&#128269;</>}
            value={"howdy"}
            onChange={(e) => {
              console.log("TODO");
            }}
          />
        )}
        {form.locationType === "latlong" && (
          <div className="flex gap-1">
            <div className="flex-grow">
              <TextInput
                id="lat"
                label="Latitude"
                showLabel={false}
                value={form.lat}
                onChange={(e) => {
                  setForm({
                    lat: Number(e.currentTarget.value),
                  });
                }}
              />
            </div>
            <div className="flex-grow">
              <TextInput
                id="long"
                label="Longitude"
                showLabel={false}
                value={form.long}
                onChange={(e) => {
                  setForm({
                    long: Number(e.currentTarget.value),
                  });
                }}
              />
            </div>
          </div>
        )}
        {form.locationType === "crags" && (
          <TextInput
            id="search-crags"
            label="Search by crags"
            showLabel={false}
            iconLeft={<>&#128269;</>}
            value={"crags"}
            onChange={(e) => {
              console.log("TODO");
            }}
          />
        )}
        {["latlong", "map"].includes(form.locationType) && (
          <div className="flex items-center">
            <div>Within</div>
            <TextInput
              containerClassName="mx-2"
              className="w-24"
              type="number"
              id="distance"
              label="Maximum distance"
              showLabel={false}
              value={form.distanceMax}
              onChange={(e) => {
                setForm({
                  distanceMax: Number(e.currentTarget.value),
                });
              }}
            />
            <div>km</div>
          </div>
        )}
      </div>
      <div className="p-2 border-b border-slate-300">
        <Label>Grade ranges</Label>
        {form.gradeRanges.map((range, i) => {
          const gradeType = gradesRef.systemTypes[range.system];
          const { gradeIds, grades } =
            gradesRef.types[gradeType].systems[range.system];
          return (
            <div key={i} className="flex gap-1">
              <Select
                containerClassName="flex-grow"
                id={`range-${i}-type`}
                label="Climbing type"
                showLabel={false}
                value={range.system}
                onChange={(e) => {
                  const newSystemId = Number(e.currentTarget.value);
                  const newSystemType = gradesRef.systemTypes[newSystemId];
                  const newSystem =
                    gradesRef.types[newSystemType].systems[newSystemId];
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
                    {Object.entries(type.systems).map(([systemId, system]) => (
                      <option key={systemId} value={systemId}>
                        {type.name !== system.name
                          ? `${type.name}: ${system.name}`
                          : system.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <Select
                containerClassName="w-24"
                id={`range-${i}-min`}
                label="Grade minimum"
                showLabel={false}
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
              </Select>
              <Select
                containerClassName="w-24"
                id={`range-${i}-max`}
                label="Grade maximum"
                showLabel={false}
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
              </Select>
              <div>
                <Button
                  variant="utility"
                  aria-label="remove"
                  onClick={() => {
                    const newRanges = [...form.gradeRanges];
                    newRanges.splice(i, 1);
                    setForm({ gradeRanges: newRanges });
                  }}
                >
                  &#x2715;
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          variant="utility"
          onClick={() => {
            const newRanges = [
              ...form.gradeRanges,
              { system: 2, start: 1, end: 12 },
            ];
            setForm({ gradeRanges: newRanges });
          }}
        >
          + Add
        </Button>
      </div>
      <div className="p-2 border-b border-slate-300">
        <div className="flex gap-1">
          <TextInput
            containerClassName="flex-grow"
            id="min-height"
            label="Min height"
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
          <TextInput
            containerClassName="flex-grow"
            id="max-height"
            label="Max height"
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
        <Tag
          checked={form.heightIncludeZero}
          onClick={() =>
            setForm({
              heightIncludeZero: !form.heightIncludeZero,
            })
          }
        >
          Include routes with no height data
        </Tag>
      </div>
      <div className="p-2 border-b border-slate-300">
        <div className="flex gap-1">
          <TextInput
            containerClassName="flex-grow"
            id="min-pitches"
            label="Min pitches"
            type="number"
            value={form.pitchesMin}
            onChange={(e) => {
              const newNum = Math.min(
                Number(e.currentTarget.value),
                form.pitchesMax
              );
              setForm({
                pitchesMin: newNum,
              });
            }}
          />
          <TextInput
            containerClassName="flex-grow"
            id="max-pitches"
            label="Max pitches"
            type="number"
            value={form.pitchesMax}
            onChange={(e) => {
              const newNum = Math.max(
                Number(e.currentTarget.value),
                form.pitchesMin
              );
              setForm({
                pitchesMax: newNum,
              });
            }}
          />
        </div>
        <Tag
          checked={form.pitchesIncludeZero}
          onClick={() =>
            setForm({
              pitchesIncludeZero: !form.pitchesIncludeZero,
            })
          }
        >
          Include routes with no pitch data
        </Tag>
      </div>
      <div className="p-2 border-b border-slate-300">
        <div className="flex gap-1">
          <Select
            containerClassName="flex-grow"
            id="min-stars"
            label="Min stars"
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
          </Select>
          <Select
            containerClassName="flex-grow"
            id="max-stars"
            label="Max stars"
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
          </Select>
        </div>
      </div>
      <div className="p-2 pb-0 border-b border-slate-300">
        <TextInput
          containerClassName="flex-grow"
          id="route-name-filter"
          label="Route name filter"
          value={form.routeNameFilter}
          onChange={(e) => {
            setForm({
              routeNameFilter: e.currentTarget.value,
            });
          }}
        />
      </div>
      <div className="p-2 pb-6">
        <Button onClick={() => search()}>Search</Button>
      </div>
    </div>
  );
}
