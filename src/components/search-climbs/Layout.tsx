"use client";

import React from "react";
import { FilterForm } from "./FilterForm";
import { useData, useGrades } from "@/store/hooks";
import { ResultsList } from "./ResultsList";

type Layout = [boolean, boolean, boolean];
const initialLayout: Layout = [true, false, true];

export function Layout() {
  const grades = useGrades();
  const { filters, results, search } = useData();
  const [layout, setLayout] = React.useState<Layout>(initialLayout);
  const [showList, showMap, showFilters] = layout;

  return (
    <div className="h-screen w-full absolute flex flex-col gap-px">
      <header className="flex bg-gray-900">
        <button
          className="p-2"
          onClick={() => {
            setLayout([
              !showList,
              !showMap && !showList ? true : showMap,
              showFilters,
            ]);
          }}
        >
          List {showList && "*"}
        </button>
        <button
          className="p-2"
          onClick={() => {
            setLayout([
              !showMap && !showList ? true : showList,
              !showMap,
              showFilters,
            ]);
          }}
        >
          Map {showMap && "*"}
        </button>
        <button
          className="ml-auto p-2"
          onClick={() => {
            setLayout([showMap, showList, !showFilters]);
          }}
        >
          Filters {showFilters && "*"}
        </button>
      </header>
      <main className="flex flex-grow gap-px">
        <section className="flex flex-grow gap-px overflow-y-auto">
          {showList && (
            <div className="flex-grow h-full bg-gray-900">
              <ResultsList results={results} />
            </div>
          )}
          {showMap && <div className="flex-grow h-full bg-gray-900">Map</div>}
        </section>
        {showFilters && (
          <section className="w-80 bg-gray-900 overflow-y-auto">
            <FilterForm search={search} grades={grades} />
          </section>
        )}
      </main>
    </div>
  );
}
