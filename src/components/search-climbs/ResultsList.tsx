"use client";

import React from "react";
import { useStore } from "@/store/store";
import { RouteSearchForm } from "@/store/types";
import Link from "next/link";
import { renderName, renderStars, useRenderGrade } from "../utils";

const headers = [
  { name: "Name", sortKey: "name" },
  { name: "Grade", sortKey: "gradescore" },
  { name: "Stars", sortKey: "stars" },
  { name: "Height", sortKey: "height" },
  { name: "Pitches", sortKey: "pitches" },
  { name: "Crag", sortKey: "crag_name" },
];

export function ResultsList() {
  const {
    results,
    grades: gradesRef,
    form,
    setForm,
    search,
    activeRoute,
    setActiveRoute,
  } = useStore();
  const renderGrade = useRenderGrade();

  // get element ref for active rows
  const activeRouteRow = React.useRef<HTMLTableRowElement>(null);

  // scroll into view if active rows change
  React.useEffect(() => {
    if (activeRouteRow.current) {
      activeRouteRow.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeRoute]);

  // add distance to headers if set
  const headersWithDistance = React.useMemo(() => {
    if (results?.crags[0]?.distance !== undefined) {
      return [...headers, { name: "Distance", sortKey: "distance" }];
    }
    return headers;
  }, [results]);

  if (!gradesRef || !form) {
    return <div className="px-2 py-4">Loading...</div>;
  }
  if (!results || !results.routes.length) {
    return <div className="px-2 py-4">No results to display...</div>;
  }

  const activeRouteObj = results.routes.find((r) => r.id === activeRoute);
  return (
    <table className="p-2 text-xs">
      <thead>
        <tr>
          {headersWithDistance.map((header, i) => (
            <Th
              key={i}
              onClick={
                header.sortKey
                  ? () => {
                      const newForm = {
                        sortKey: header.sortKey,
                        sortDirection:
                          form.sortKey === header.sortKey &&
                          form.sortDirection === "asc"
                            ? "desc"
                            : "asc",
                      } as Partial<RouteSearchForm>;
                      setForm(newForm);
                      search();
                    }
                  : undefined
              }
            >
              {header.name}
              <span className="inline-block w-2 ml-1">
                {form.sortKey === header.sortKey &&
                  form.sortDirection === "asc" && <>&uarr;</>}
                {form.sortKey === header.sortKey &&
                  form.sortDirection === "desc" && <>&darr;</>}
              </span>
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.routes.map((route, i) => {
          const crag = results.crags.find((l) => l.id === route.crag_id);
          return (
            <tr
              key={route.id}
              className={
                activeRoute === route.id
                  ? "bg-amber-100"
                  : i % 2 === 0
                  ? "bg-slate-100"
                  : ""
              }
              onMouseEnter={() => {
                setActiveRoute(route.id);
              }}
              ref={activeRoute === route.id ? activeRouteRow : null}
            >
              <td>
                <Link
                  className="block py-1 px-2 underline"
                  target="_blank"
                  href={`https://www.ukclimbing.com/logbook/c.php?i=${route.id}`}
                >
                  {route.name}
                </Link>
              </td>
              <td className="py-1 px-2 whitespace-nowrap">
                {renderGrade(route)}
              </td>
              <td className="whitespace-nowrap tracking-tighter px-2 text-red-600">
                {renderStars(route)}
              </td>
              <td className="py-1 px-2 whitespace-nowrap">
                {route.height === 0 ? "-" : `${route.height}m`}
              </td>
              <td className="py-1 px-2 whitespace-nowrap">
                {route.height === 0 ? "-" : `${route.pitches}`}
              </td>
              <td
                className={`border-l-4   ${
                  activeRouteObj?.crag_id === route.crag_id
                    ? "border-amber-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  className={`block py-1 px-2 underline`}
                  href={`https://www.ukclimbing.com/logbook/crag.php?id=${route.crag_id}`}
                  target="_blank"
                >
                  {renderName(crag?.name || "")}
                </Link>
              </td>
              {!!headersWithDistance.find((h) => h.sortKey === "distance") && (
                <td>
                  {crag?.distance
                    ? `${Math.round(crag.distance * 10000) / 10}km`
                    : ""}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface ThProps extends React.PropsWithChildren {
  onClick?: () => void;
}

function Th({ onClick, children }: ThProps) {
  return onClick ? (
    <th>
      <button
        type="button"
        className="block w-full px-2 py-3 text-left whitespace-nowrap"
        onClick={onClick}
      >
        {children}
      </button>
    </th>
  ) : (
    <th className="px-2 text-left whitespace-nowrap">{children}</th>
  );
}
