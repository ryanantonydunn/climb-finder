"use client";

import { useStore } from "@/store/store";
import { RouteSearchForm } from "@/store/types";
import Link from "next/link";

const headers = [
  { name: "Name", sortKey: "name" },
  { name: "Grade", sortKey: "gradescore" },
  { name: "Stars", sortKey: "stars" },
  { name: "Height", sortKey: "height" },
  { name: "Crag", sortKey: "crag_name" },
  { name: "Distance" },
];

export function ResultsList() {
  const { results, grades: gradesRef, form, setForm, search } = useStore();
  if (!gradesRef) {
    return <div className="px-2 py-4">Loading...</div>;
  }
  if (!results || !results.routes.length) {
    return <div className="px-2 py-4">No results to display...</div>;
  }

  return (
    <table className="p-2 text-xs">
      <thead>
        <tr>
          {headers.map((header, i) => (
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
        {results.routes.map((route, i) => (
          <tr key={route.id} className={i % 2 === 0 ? "bg-slate-100" : ""}>
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
              {
                gradesRef.types[route.gradetype].systems[route.gradesystem]
                  .grades[route.grade].name
              }
              &nbsp;{route.techgrade}
            </td>
            <td className="whitespace-nowrap tracking-tighter px-2 text-red-600">
              {route.stars >= 1 && <span>&#9733;</span>}
              {route.stars >= 2 && <span>&#9733;</span>}
              {route.stars >= 3 && <span>&#9733;</span>}
            </td>
            <td className="py-1 px-2 whitespace-nowrap">
              {route.height === 0 ? "-" : `${route.height}m`}
            </td>
            <td>
              <Link
                className="block py-1 px-2 underline"
                href={`https://www.ukclimbing.com/logbook/crag.php?id=${route.crag_id}`}
                target="_blank"
                dangerouslySetInnerHTML={{
                  __html:
                    results.crags.find((l) => l.id === route.crag_id)?.name ||
                    "",
                }}
              ></Link>
            </td>
            <td>-</td>
          </tr>
        ))}
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
