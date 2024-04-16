"use client";

import {
  RouteSearchFormHook,
  Grades,
  RouteSearchResults,
  RouteSearchFn,
  RouteSearchForm,
} from "@/store/types";

interface ResultsListProps {
  results: RouteSearchResults | null;
  grades: Grades | null;
  form: RouteSearchFormHook;
  search: RouteSearchFn;
}

const headers = [
  { name: "Name", sortKey: "name" },
  { name: "Grade", sortKey: "gradescore" },
  { name: "Stars", sortKey: "stars" },
  { name: "Height", sortKey: "height" },
  { name: "Crag", sortKey: "crag_name" },
  { name: "Distance" },
];

export function ResultsList({
  results,
  grades,
  form: formObj,
  search,
}: ResultsListProps) {
  if (!results || !grades || !formObj.form) {
    return <div>No results to display...</div>;
  }
  const { form, setForm } = formObj;

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
                      const newFormComplete = { ...form, ...newForm };
                      search(newFormComplete, grades.idsByType);
                    }
                  : undefined
              }
            >
              {header.name}
              {form.sortKey === header.sortKey &&
                form.sortDirection === "asc" && (
                  <span className="ml-2">&uarr;</span>
                )}
              {form.sortKey === header.sortKey &&
                form.sortDirection === "desc" && (
                  <span className="ml-2">&darr;</span>
                )}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.routes.map((route, i) => (
          <tr key={route.id} className={i % 2 === 0 ? "bg-gray-800" : ""}>
            <td>
              <a
                className="block py-1 px-2 underline"
                href={`https://www.ukclimbing.com/logbook/c.php?i=${route.id}`}
              >
                {route.name}
              </a>
            </td>
            <td className="py-1 px-2 whitespace-nowrap">
              {grades.grades.find((g) => g.id === route.grade)?.name}
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
              <a
                className="block py-1 px-2 underline"
                href={`https://www.ukclimbing.com/logbook/crag.php?id=${route.crag_id}`}
                dangerouslySetInnerHTML={{
                  __html:
                    results.crags.find((l) => l.id === route.crag_id)?.name ||
                    "",
                }}
              ></a>
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
        className="block w-full p-1 text-left"
        onClick={onClick}
      >
        {children}
      </button>
    </th>
  ) : (
    <th className="p-1 text-left">{children}</th>
  );
}
