"use client";

import React from "react";
import { FilterForm } from "./FilterForm";
import { useData } from "@/store/hooks";
import { ResultsList } from "./ResultsList";

type Layout = [boolean, boolean, boolean];
const initialLayout: Layout = [true, false, true];

export function Layout() {
  const { filters, results, search } = useData();
  const [layout, setLayout] = React.useState<Layout>(initialLayout);
  const [showList, showMap, showFilters] = layout;

  return (
    <div className="h-screen overflow-hidden flex flex-col gap-px">
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
          List
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
          Map
        </button>
        <button
          className="ml-auto p-2"
          onClick={() => {
            setLayout([showMap, showList, !filters]);
          }}
        >
          Filters
        </button>
      </header>
      <main className="flex flex-grow gap-px">
        <section className="flex flex-grow gap-px">
          {showList && (
            <div className="flex-grow h-full bg-gray-900">
              <ResultsList results={results} />
            </div>
          )}
          {showMap && <div className="flex-grow h-full bg-gray-900">Map</div>}
        </section>
        {showFilters && (
          <section className="w-80 bg-gray-900">
            <FilterForm search={search} />
          </section>
        )}
      </main>
    </div>
  );
}
