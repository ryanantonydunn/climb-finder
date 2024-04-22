"use client";

import { useStore } from "@/store/store";
import {
  RouteSearchForm,
  RouteSearchLocationType,
  maxNumber,
} from "@/store/types";
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

interface LocalText {
  locationSearch: string;
  cragSearch: string;
  lat: string;
  long: string;
  distanceMax: string;
  heightMin: string;
  heightMax: string;
  pitchesMin: string;
  pitchesMax: string;
  routeNameFilter: string;
}

export function FilterForm() {
  const { grades: gradesRef, form, setForm, search } = useStore();

  // handle local text input state
  const [localText, setLocalTextRaw] = React.useState<LocalText>({
    locationSearch: "",
    cragSearch: "",
    lat: "0",
    long: "0",
    distanceMax: "0",
    heightMin: "0",
    heightMax: "0",
    pitchesMin: "0",
    pitchesMax: "0",
    routeNameFilter: "",
  });
  const setLocalText = React.useCallback((values: Partial<LocalText>) => {
    setLocalTextRaw((v) => ({ ...v, ...values }));
  }, []);
  React.useEffect(() => {
    if (!form) return;
    setLocalTextRaw({
      locationSearch: form.locationSearch,
      cragSearch: form.cragSearch,
      lat: String(form.lat),
      long: String(form.long),
      distanceMax: String(form.distanceMax),
      heightMin: String(form.heightMin),
      heightMax: String(form.heightMax),
      pitchesMin: String(form.pitchesMin),
      pitchesMax: String(form.pitchesMax),
      routeNameFilter: form.routeNameFilter,
    });
  }, [form]);

  if (!gradesRef || !form) {
    return <div className="px-2 py-4">Loading...</div>;
  }

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
            value={localText.locationSearch}
            onChange={(e) => {
              setLocalText({ locationSearch: e.currentTarget.value });
            }}
            onBlur={() => {
              setForm({ locationSearch: localText.locationSearch });
            }}
            maxLength={50}
          />
        )}
        {form.locationType === "latlong" && (
          <div className="flex gap-1">
            <div className="flex-grow">
              <TextInput
                id="lat"
                label="Latitude"
                showLabel={false}
                value={localText.lat}
                onChange={(e) => {
                  setLocalText({ lat: e.currentTarget.value });
                }}
                onBlur={() => {
                  setForm({ lat: Number(localText.lat) });
                }}
                maxLength={50}
              />
            </div>
            <div className="flex-grow">
              <TextInput
                id="long"
                label="Longitude"
                showLabel={false}
                value={localText.long}
                onChange={(e) => {
                  setLocalText({ long: e.currentTarget.value });
                }}
                onBlur={() => {
                  setForm({ long: Number(localText.long) });
                }}
                maxLength={50}
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
            value={localText.cragSearch}
            onChange={(e) => {
              setLocalText({ cragSearch: e.currentTarget.value });
            }}
            onBlur={() => {
              setForm({ cragSearch: localText.cragSearch });
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
              value={localText.distanceMax}
              onChange={(e) => {
                setLocalText({ distanceMax: e.currentTarget.value });
              }}
              onBlur={() => {
                setForm({
                  distanceMax: Math.min(
                    Number(localText.distanceMax),
                    maxNumber
                  ),
                });
              }}
              maxLength={50}
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
            label="Min height (m)"
            type="number"
            value={localText.heightMin}
            onChange={(e) => {
              setLocalText({ heightMin: e.currentTarget.value });
            }}
            onBlur={() => {
              const newNum = Math.min(
                Number(localText.heightMin),
                form.heightMax
              );
              setForm({
                heightMin: Math.min(newNum, maxNumber),
              });
            }}
            maxLength={50}
          />
          <TextInput
            containerClassName="flex-grow"
            id="max-height"
            label="Max height (m)"
            type="number"
            value={localText.heightMax}
            onChange={(e) => {
              setLocalText({ heightMax: e.currentTarget.value });
            }}
            onBlur={() => {
              const newNum = Math.max(
                Number(localText.heightMax),
                form.heightMin
              );
              setForm({
                heightMax: Math.min(newNum, maxNumber),
              });
            }}
            maxLength={50}
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
            value={localText.pitchesMin}
            onChange={(e) => {
              setLocalText({ pitchesMin: e.currentTarget.value });
            }}
            onBlur={() => {
              const newNum = Math.min(
                Number(localText.pitchesMin),
                form.pitchesMax
              );
              setForm({
                pitchesMin: Math.min(newNum, maxNumber),
              });
            }}
            maxLength={50}
          />
          <TextInput
            containerClassName="flex-grow"
            id="max-pitches"
            label="Max pitches"
            type="number"
            value={localText.pitchesMax}
            onChange={(e) => {
              setLocalText({ pitchesMax: e.currentTarget.value });
            }}
            onBlur={() => {
              const newNum = Math.max(
                Number(localText.pitchesMax),
                form.pitchesMin
              );
              setForm({
                pitchesMax: Math.min(newNum, maxNumber),
              });
            }}
            maxLength={50}
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
          value={localText.routeNameFilter}
          onChange={(e) => {
            setLocalText({ routeNameFilter: e.currentTarget.value });
          }}
          onBlur={() => {
            setForm({
              routeNameFilter: localText.routeNameFilter,
            });
          }}
          maxLength={50}
        />
      </div>
      <div className="p-2 pb-6">
        <Button onClick={() => search()}>Search</Button>
      </div>
    </div>
  );
}
