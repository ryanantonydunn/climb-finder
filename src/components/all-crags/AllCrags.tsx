"use client";

import { Crag } from "@/store/types";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import React from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";

export default function AllCrags() {
  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <MapContainer center={[0, 0]} zoom={7} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapItems />
      </MapContainer>
    </div>
  );
}

function MapItems() {
  const map = useMap();
  const [results, setResults] = React.useState<Crag[]>([]);

  React.useEffect(() => {
    async function load() {
      const res = await fetch("/api/all-crags");
      const json = (await res.json()) as Crag[];
      setResults(json);
      map.fitBounds(json.map((crag) => [crag.lat, crag.long]));
    }
    load();
  }, [map]);

  return results.map((crag) => {
    return (
      <CircleMarker
        key={crag.id}
        center={[crag.lat, crag.long]}
        radius={4}
      ></CircleMarker>
    );
  });
}
