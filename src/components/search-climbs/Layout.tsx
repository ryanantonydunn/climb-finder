"use client";

import { useForm, useGrades } from "@/store/hooks";
import React from "react";
import { Loading } from "../base/Loading";
import { Tag } from "../base/Tag";
import { FilterForm } from "./FilterForm";
import { MapDynamic } from "./MapDynamic";
import { ResultsList } from "./ResultsList";
import { useStore } from "@/store/store";
import { isDesktop } from "@/store/helpers";

export function Layout() {
  useGrades();
  useForm();
  const { grades, isSearching, screenLayout, setScreenLayout } = useStore();
  const [list, map, filters] = screenLayout;

  React.useEffect(() => {
    setScreenLayout(isDesktop() ? [true, true, true] : [false, false, true]);
  }, [setScreenLayout]);

  return (
    <div className="h-screen w-full absolute flex flex-col text-xs">
      <header className="flex items-center bg-slate-100 border-b border-slate-300 p-1">
        <Tag
          onClick={() => {
            setScreenLayout(
              isDesktop() ? [!list, map, filters] : [true, false, false]
            );
          }}
          checked={list}
        >
          List
        </Tag>
        <Tag
          className="ml-1"
          onClick={() => {
            setScreenLayout(
              isDesktop() ? [list, !map, filters] : [false, true, false]
            );
          }}
          checked={map}
        >
          Map
        </Tag>
        <Tag
          className="ml-auto"
          onClick={() => {
            setScreenLayout(
              isDesktop() ? [list, map, !filters] : [false, false, true]
            );
          }}
          checked={filters}
        >
          Filters
        </Tag>
      </header>
      <div className="flex-grow relative">
        <main className="absolute w-full h-full flex">
          {list && (
            <section className="flex-1 h-full overflow-auto border-r border-slate-300">
              <ResultsList />
            </section>
          )}
          {map && (
            <section className="flex-1 h-full overflow-hidden border-r border-slate-300">
              <MapDynamic />
            </section>
          )}
          {filters && (
            <section className="w-full md:w-80 h-full overflow-y-auto">
              <FilterForm />
            </section>
          )}
          <Loading isActive={!grades || isSearching} />
        </main>
      </div>
    </div>
  );
}
