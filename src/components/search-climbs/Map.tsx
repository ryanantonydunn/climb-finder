"use client";

import { useStore } from "@/store/store";
import { LatLng, LatLngTuple } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import React from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Button } from "../base/Button";
import { renderName, renderStars, useRenderGrade } from "../utils";
import { isDesktop } from "@/store/helpers";

export default function Map() {
  const { form } = useStore();
  if (!form) return;
  const center: LatLngTuple =
    form.lat !== undefined && form.long !== undefined
      ? [form.lat, form.long]
      : [0, 0];
  return (
    <MapContainer center={center} zoom={7} style={{ height: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapItems />
      <LatLngSearchPopup />
    </MapContainer>
  );
}

function MapItems() {
  const map = useMap();
  const renderGrade = useRenderGrade();
  const { results, activeRoute, setActiveRoute, screenLayout } = useStore();

  // resize when layout changes
  React.useEffect(() => {
    map.invalidateSize();
  }, [screenLayout, map]);

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
    click(e) {
      // remove last hovered item if clicked
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
    if (!results) return;
    const route = results.routes.find((r) => r.id === activeRoute);
    const crag = results.crags.find((c) => c.id === route?.crag_id);
    if (crag) {
      const cragLocation: LatLngTuple = [crag.lat, crag.long];
      const isInBounds = map.getBounds().contains(cragLocation);
      if (!isInBounds) {
        map.flyTo(cragLocation);
      }
    }
  }, [activeRoute, map, results]);

  if (!sortedResults) return;

  const activeRouteObj = results?.routes.find((r) => r.id === activeRoute);

  return sortedResults.map((crag) => {
    const isOpen = activeRouteObj?.crag_id === crag.id;
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
              <tbody>
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
                        {renderName(route.name)}
                      </a>
                    </td>
                    <td className="p-1 font-bold">{renderGrade(route)}</td>
                    <td className="p-1 text-red-600">{renderStars(route)}</td>
                    <td className="p-1">
                      {route.height ? `${route.height}m` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tooltip>
        )}
      </Marker>
    );
  });
}

function LatLngSearchPopup() {
  const { form, setForm, setScreenLayout } = useStore();
  const [position, setPosition] = React.useState<LatLng | null>(null);
  const map = useMapEvents({
    contextmenu(e) {
      setPosition(e.latlng);
    },
    dblclick(e) {
      setPosition(e.latlng);
    },
  });

  return (
    <>
      {form &&
        ["latlong", "map"].includes(form.locationType) &&
        form.lat !== undefined &&
        form.long !== undefined && (
          <CircleMarker
            center={[form.lat || 0, form.long]}
            pathOptions={{ color: "red" }}
            radius={10}
          ></CircleMarker>
        )}
      {position === null ? null : (
        <Popup position={position}>
          <Button
            onClick={() => {
              setForm({
                locationType: "latlong",
                lat: position.lat,
                long: position.lng,
              });
              if (!isDesktop()) {
                setScreenLayout([false, false, true]);
              }
              setPosition(null);
            }}
          >
            Search from here
          </Button>
        </Popup>
      )}
    </>
  );
}
