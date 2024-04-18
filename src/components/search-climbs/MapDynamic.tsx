import dynamic from "next/dynamic";

export const MapDynamic = dynamic(
  () => import("@/components/search-climbs/Map"),
  {
    ssr: false,
  }
);
