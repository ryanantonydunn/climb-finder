"use client";

import { useGrades } from "@/store/hooks";
import React from "react";
import { Loading } from "../base/Loading";
import { Tag } from "../base/Tag";
import { FilterForm } from "./FilterForm";
import { Map } from "./Map";
import { ResultsList } from "./ResultsList";
import { useStore } from "@/store/store";

export function Layout() {
  useGrades();
  const { grades, isSearching } = useStore();
  const [showList, setShowList] = React.useState(true);
  const [showMap, setShowMap] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(true);

  return (
    <div className="h-screen w-full absolute flex flex-col text-xs">
      <header className="flex items-center bg-slate-100 border-b border-slate-300 p-1">
        <Tag onClick={() => setShowList(!showList)} checked={showList}>
          List
        </Tag>
        <Tag
          className="ml-1"
          onClick={() => setShowMap(!showMap)}
          checked={showMap}
        >
          Map
        </Tag>
        <Tag
          className="ml-auto"
          onClick={() => setShowFilters(!showFilters)}
          checked={showFilters}
        >
          Filters
        </Tag>
      </header>
      <div className="flex-grow relative">
        <main className="absolute w-full h-full flex">
          {showList && (
            <section className="flex-1 h-full overflow-auto border-r border-slate-300">
              <ResultsList />
            </section>
          )}
          {showMap && (
            <section className="flex-1 h-full overflow-hidden border-r border-slate-300">
              <Map />
            </section>
          )}
          {showFilters && (
            <section className="w-80 h-full overflow-y-auto">
              <FilterForm />
            </section>
          )}
          <Loading isActive={!grades || isSearching} />
        </main>
      </div>
    </div>
  );
}
