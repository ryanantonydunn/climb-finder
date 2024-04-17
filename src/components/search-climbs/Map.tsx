"use client";

import { useStore } from "@/store/store";

export function Map() {
  const { results } = useStore();
  return <div>Map</div>;
}
