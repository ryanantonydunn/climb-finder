"use client";

import { useStore } from "@/store/store";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import React from "react";
import {
  Marker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { renderName, renderStars, useRenderGrade } from "../utils";

export default function Map() {
  const { form } = useStore();
  if (!form) return;
  return (
    <MapContainer
      center={[form.lat, form.long]}
      zoom={7}
      style={{ height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapItems />
    </MapContainer>
  );
}

function MapItems() {
  const map = useMap();
  const renderGrade = useRenderGrade();
  const { results, activeRoute, setActiveRoute } = useStore();

  // build reference object for routes
  const sortedResults = React.useMemo(() => {
    if (!results) return;
    return results.crags
      .map((crag) => ({
        ...crag,
        routes: results.routes.filter((r) => r.crag_id === crag.id),
      }))
      .filter((c) => !!c.routes.length);
  }, [results]);

  // show or hide permanenet tooltips on zoom
  const [zoom, setZoom] = React.useState(8);
  const mapEvents = useMapEvents({
    zoom(e) {
      setZoom(e.target._zoom);
    },
    viewreset(e) {
      setZoom(e.target._zoom);
    },

    // remove last hovered item if clicked
    click(e) {
      const targetElement = e.originalEvent.target as Element;
      // only remove if we are not clicking inside a tooltip
      if (
        [
          targetElement,
          targetElement.parentElement,
          targetElement.parentElement?.parentElement,
        ].every((el) => !el?.classList.contains("leaflet-tooltip"))
      ) {
        setActiveRoute(undefined);
      }
    },
  });
  const areTooltipsPermanenet = zoom >= 13;

  // zoom map to show new pins
  React.useEffect(() => {
    if (sortedResults?.length) {
      map.fitBounds(sortedResults.map((crag) => [crag.lat, crag.long]));
    }
  }, [map, sortedResults]);

  // reset active crag and route if results change
  React.useEffect(() => {
    setActiveRoute(undefined);
  }, [sortedResults, setActiveRoute]);

  // fly to point when highlighted route changes
  React.useEffect(() => {
    console.log("1");
    if (!results) return;
    const route = results.routes.find((r) => r.id === activeRoute);
    const crag = results.crags.find((c) => c.id === route?.crag_id);
    console.log("2", route?.id, crag?.id);
    if (crag) {
      console.log("3", crag.lat, crag.long);
      map.flyTo([crag.lat, crag.long]);
    }
  }, [activeRoute, map, results]);

  if (!sortedResults) return;

  const activeRouteObj = results?.routes.find((r) => r.id === activeRoute);

  return sortedResults.map((crag) => {
    const isOpen = areTooltipsPermanenet || activeRouteObj?.crag_id === crag.id;
    return (
      <Marker
        key={crag.id}
        position={[crag.lat, crag.long]}
        eventHandlers={{
          mouseover: (e) => {
            setActiveRoute(crag.routes[0].id);
          },
        }}
      >
        {isOpen && (
          <Tooltip permanent interactive direction="right">
            <h3 className="pb-1 font-bold">
              <a
                className="text-xs text-black underline"
                style={{ color: "black" }}
                target="_blank"
                href={`https://www.ukclimbing.com/logbook/crag.php?id=${crag.id}`}
              >
                {renderName(crag.name)}
              </a>
            </h3>
            <table>
              {crag.routes.map((route, i) => (
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
                >
                  <td>
                    <a
                      className="text-xs underline px-1"
                      style={{ color: "black" }}
                      target="_blank"
                      href={`https://www.ukclimbing.com/logbook/c.php?i=${route.id}`}
                    >
                      {route.name}
                    </a>
                  </td>
                  <td className="p-1 font-bold">{renderGrade(route)}</td>
                  <td className="p-1 text-red-600">{renderStars(route)}</td>
                  <td className="p-1">
                    {route.height ? `${route.height}m` : ""}
                  </td>
                </tr>
              ))}
            </table>
          </Tooltip>
        )}
      </Marker>
    );
  });
}
