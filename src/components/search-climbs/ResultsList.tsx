"use client";

import { ClimbingRouteSearchResults } from "@/store/types";

interface ResultsListProps {
  results: ClimbingRouteSearchResults | null;
}

export function ResultsList({ results }: ResultsListProps) {
  if (!results) {
    return <div>No results to display...</div>;
  }

  return (
    <table className="p-2 text-xs">
      <thead>
        <tr>
          <th>Name</th>
          <th>Grade</th>
          <th>Stars</th>
          <th>Height</th>
          <th>Crag</th>
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        {results.routes.map((route) => (
          <tr key={route.id}>
            <td>{route.name}</td>
            <td>{route.gradescore}</td>
            <td>
              {Array.from({ length: route.stars })
                .map(() => "*")
                .join("")}
            </td>
            <td>{route.height === 0 ? "-" : `${route.height}m`}</td>
            <td
              dangerouslySetInnerHTML={{
                __html:
                  results.locations.find((l) => l.id === route.crag_id)?.name ||
                  "",
              }}
            ></td>
            <td>-</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
