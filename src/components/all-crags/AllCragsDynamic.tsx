import dynamic from "next/dynamic";

export const AllCragsDynamic = dynamic(
  () => import("@/components/all-crags/AllCrags"),
  {
    ssr: false,
  }
);
