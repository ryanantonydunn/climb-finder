import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const str = decodeURIComponent(req.url.split("q=")[1] || "")
      .replace(/[^\w\s]/gi, "")
      .slice(0, 50);
    if (!str) return;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      str
    )}&format=json`;
    const res = await fetch(url);
    const json = await res.json();
    const items = json.map((item: Result) => ({
      label: item.display_name,
      value: [item.lat, item.lon],
    }));
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

interface Result {
  display_name: string;
  lat: string;
  lon: string;
}
